from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User
import json

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
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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