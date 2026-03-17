from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User
import json
import pandas as pd
import os
import numpy as np
from datetime import datetime, timedelta
from django.conf import settings
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Try to load TensorFlow model
try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.layers import Dense, LSTM

    # Custom layers to handle Keras 3 'quantization_config' in Keras 2/Legacy environment
    class SafeDense(Dense):
        def __init__(self, *args, **kwargs):
            kwargs.pop('quantization_config', None)
            super().__init__(*args, **kwargs)

        @classmethod
        def from_config(cls, config):
            if 'quantization_config' in config:
                config.pop('quantization_config')
            return super().from_config(config)

    class SafeLSTM(LSTM):
        def __init__(self, *args, **kwargs):
            kwargs.pop('quantization_config', None)
            super().__init__(*args, **kwargs)

        @classmethod
        def from_config(cls, config):
            if 'quantization_config' in config:
                config.pop('quantization_config')
            return super().from_config(config)

    model_path = settings.BASE_DIR.parent.parent.parent / 'ml' / 'lstm_menstrual_cycle_model.h5'
    if os.path.exists(model_path):
        # compile=False is safer for inference only and avoids some version incompatibilities
        # custom_objects needed for quantization_config mismatch
        cycle_model = load_model(str(model_path), compile=False, custom_objects={'Dense': SafeDense, 'LSTM': SafeLSTM})
        print(f"Model loaded from {model_path}")
    else:
        print(f"Model not found at {model_path}")
        cycle_model = None
except Exception as e:
    print(f"Failed to load model: {e}")
    cycle_model = None

SEQUENCE_LENGTH = 3

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }
    

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    JWT Login View
    Expects: { "email": "user@example.com", "password": "password" }
    Returns: { "access": "token", "refresh": "token", "user": { user_data } }
    """
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Debug logging
        print(f"Login attempt: email={email}")
        print(f"Users in database: {User.objects.count()}")
        try:
            user_check = User.objects.get(email=email)
            print(f"User found: {user_check.email}")
            print(f"Password check: {user_check.check_password(password)}")
        except User.DoesNotExist:
            print(f"User with email {email} does not exist")

        user = authenticate(request, email=email, password=password)

        if not user:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        tokens = get_tokens_for_user(user)

        user_data = {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'age': user.age,
            'cycle_length': user.cycle_length,
            'is_staff': user.is_staff,
        }

        return Response(
            {
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': user_data,
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check API
    Used to verify backend is running
    """
    return Response({
        "status": "ok",
        "message": "Backend is running successfully",
        "service": "Synkria API",
        "version": "1.0.0"
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    try:
        email = request.data.get("email")
        password = request.data.get("password")
        name = request.data.get("name")
        age = request.data.get("age")
        cycle_length = request.data.get("cycleLength", 28)  # 👈 FIX

        if not email or not password or not name:
            return Response(
                {"error": "Email, password and name are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "User with this email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.create_user(
            email=email,
            password=password,
            name=name,
            age=age,
            cycle_length=cycle_length
        )

        tokens = get_tokens_for_user(user)

        return Response({
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "age": user.age,
                "cycle_length": user.cycle_length
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"error": str(e)}, status=500)



@api_view(['POST'])
def logout_view(request):
    """
    JWT Logout View - Blacklist refresh token
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            # Token might already be blacklisted or invalid
            pass

        return Response({
            'message': 'Successfully logged out'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .models import User, CyclePrediction
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_cycle_view(request):
    """
    Predict Next Period API
    Expects: { "periods": [ { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }, ... ] }
    Must provide exactly 3 periods.
    Saves prediction to database and returns notification if imminent.
    """
    if cycle_model is None:
        return Response({'error': 'Prediction model is not available.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    try:
        periods_data = request.data.get('periods', [])
        
        if len(periods_data) < SEQUENCE_LENGTH:
             return Response({'error': f'Need at least {SEQUENCE_LENGTH} past periods to predict.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse dates and calculate lengths
        # We need the LAST 3 periods from the input
        # Input format expected: list of dicts with 'start' and 'end'
        
        relevant_periods = periods_data[-SEQUENCE_LENGTH:] # Take last 3
        cycle_lengths = []
        parsed_periods = []

        for p in relevant_periods:
            start_str = p.get('start')
            end_str = p.get('end')
            
            if not start_str or not end_str:
                return Response({'error': 'Missing start or end date in one of the periods.'}, status=status.HTTP_400_BAD_REQUEST)
            
            start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
            
            if end_date <= start_date:
                return Response({'error': 'End date must be after start date.'}, status=status.HTTP_400_BAD_REQUEST)

            parsed_periods.append((start_date, end_date))
            cycle_lengths.append((end_date - start_date).days)

        input_seq = np.array(cycle_lengths).reshape((1, SEQUENCE_LENGTH, 1))
        
        prediction = cycle_model.predict(input_seq, verbose=0)[0][0]
        predicted_gap = round(prediction) 
        
        last_period_end = parsed_periods[-1][1]
        next_period_start = last_period_end + timedelta(days=predicted_gap)
        
        # Save prediction
        CyclePrediction.objects.create(
            user=request.user,
            last_period_date=last_period_end,
            predicted_date=next_period_start,
            predicted_cycle_length=predicted_gap
        )

        # Check for notification (within 3 days)
        days_until = (next_period_start - datetime.now().date()).days
        notification = None
        if 0 <= days_until <= 3:
            notification = {
                "message": f"Your period is likely to start in {days_until} days!",
                "type": "warning",
                "days_until": days_until
            }
        
        return Response({
            'next_period_start': next_period_start.strftime("%Y-%m-%d"),
            'predicted_value': predicted_gap,
            'notification': notification
        }, status=status.HTTP_200_OK)

    except ValueError as ve:
         return Response({'error': f'Invalid date format. Use YYYY-MM-DD. Details: {str(ve)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def chatbot_query(request):
    """
    Chatbot API
    Expects: { "message": "user question" }
    Returns: { "answer": "best match answer" }
    """
    try:
        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Path to the CSV file
        # BASE_DIR is backend/synkria/synkria
        # We need to go up: synkria -> synkria -> backend -> root
        csv_path = settings.BASE_DIR.parent.parent.parent / 'ml' / 'data.csv'
        
        if not os.path.exists(csv_path):
             return Response({'error': 'Knowledge base not found', 'path': str(csv_path)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
             df = pd.read_csv(csv_path)
        except Exception as e:
             return Response({'error': f'Failed to load knowledge base: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Cosine Similarity Matching
        questions = df['question'].astype(str).tolist()
        questions.append(user_message)  # Add user message to corpus for vectorization

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(questions)

        # The last vector is the user's message
        user_vector = tfidf_matrix[-1]
        
        # Calculate cosine similarity with all other questions (excluding the user's own message)
        cosine_sim = cosine_similarity(user_vector, tfidf_matrix[:-1])
        
        # Get the index of the best match
        best_match_idx = np.argmax(cosine_sim)
        best_match_score = cosine_sim[0][best_match_idx]

        # Threshold for accepting a match (adjustable)
        SIMILARITY_THRESHOLD = 0.2

        if best_match_score > SIMILARITY_THRESHOLD:
            best_match_question = questions[best_match_idx]
            answer = df.iloc[best_match_idx]['answer']
            return Response({
                'answer': answer, 
                'matched_question': best_match_question, 
                'confidence': float(best_match_score)
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'answer': "I'm sorry, I couldn't find a relevant answer in my knowledge base. Could you please rephrase?",
                'confidence': float(best_match_score)
            }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile
    Requires authentication
    """
    user_data = {
        'id': request.user.id,
        'email': request.user.email,
        'fullname': request.user.fullname,
        'phone': request.user.phone,
        'address': request.user.address,
        'role': request.user.role,
        'status': request.user.status
    }
    
    return Response({'user': user_data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def token_refresh(request):
    """
    JWT Token Refresh View
    Expects: { "refresh": "refresh_token" }
    Returns: { "access": "new_access_token" }
    """
    try:
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            
            return Response({
                'access': new_access_token
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid or expired refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from .pcod_model import predict_pcod

@api_view(['POST'])
@permission_classes([AllowAny])
def predict_pcod_view(request):
    """
    Predict PCOD Risk API
    Expects: {
        "age": 26,
        "bmi": 29.5,
        "irregular": 1, 
        "testosterone": 68.2,
        "follicles": 18
    }
    """
    try:
        data = request.data
        
        required_fields = ['age', 'bmi', 'irregular', 'testosterone', 'follicles']
        if not all(field in data for field in required_fields):
             return Response({'error': f'Missing required fields: {required_fields}'}, status=status.HTTP_400_BAD_REQUEST)

        result = predict_pcod(
            age=data['age'],
            bmi=data['bmi'],
            menstrual_irregularity=data['irregular'],
            testosterone=data['testosterone'],
            follicles=data['follicles']
        )
        
        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_imminent_prediction_view(request):
    """
    Check for the user's latest period prediction.
    Always returns the prediction if it exists, with an is_imminent flag.
    """
    try:
        # Get the most recent prediction for this user
        latest_prediction = CyclePrediction.objects.filter(
            user=request.user
        ).order_by('-created_at').first()
        
        if not latest_prediction:
            return Response({'notification': None}, status=status.HTTP_200_OK)
        
        # Calculate days until predicted date
        today = datetime.now().date()
        days_until = (latest_prediction.predicted_date - today).days
        
        # Imminent if within 3 days
        is_imminent = 0 <= days_until <= 3
        
        notification = {
            "message": f"Your period is likely to start in {days_until} day{'s' if days_until != 1 else ''}!",
            "type": "warning",
            "days_until": days_until,
            "predicted_date": latest_prediction.predicted_date.strftime("%Y-%m-%d"),
            "is_imminent": is_imminent
        }
        
        return Response({'notification': notification}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.permissions import IsAdminUser

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def user_list_view(request):
    """
    Get all users (Admin only)
    """
    users = User.objects.all().exclude(is_superuser=True)
    users_data = []
    for user in users:
        users_data.append({
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'age': user.age,
            'cycle_length': user.cycle_length,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'date_joined': user.date_joined if hasattr(user, 'date_joined') else None,
        })
    
    return Response({'users': users_data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_user_status(request, user_id):
    """
    Toggle user active status (Block/Unblock)
    """
    user = get_object_or_404(User, pk=user_id)
    
    if user.is_superuser:
        return Response(
            {'error': 'Cannot block superuser accounts'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    user.is_active = not user.is_active
    user.save()
    
    return Response({
        'status': 'success', 
        'message': f"User {'unblocked' if user.is_active else 'blocked'} successfully",
        'is_active': user.is_active
    })

