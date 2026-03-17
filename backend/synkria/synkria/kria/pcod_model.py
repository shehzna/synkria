import joblib
import numpy as np
import os
from django.conf import settings

# Paths to the model files
# Assuming models are in result_root/ml/ like the other models
ML_DIR = settings.BASE_DIR.parent.parent.parent / 'ml'
MODEL_PATH = ML_DIR / 'pcos_model.pkl'
SCALER_PATH = ML_DIR / 'scaler.pkl'

_model = None
_scaler = None

def load_pcod_resources():
    global _model, _scaler
    if _model is None:
        if os.path.exists(MODEL_PATH):
            try:
                _model = joblib.load(MODEL_PATH)
                print(f"PCOD Model loaded from {MODEL_PATH}")
            except Exception as e:
                print(f"Failed to load PCOD model: {e}")
        else:
            print(f"PCOD Model not found at {MODEL_PATH}")

    if _scaler is None:
        if os.path.exists(SCALER_PATH):
            try:
                _scaler = joblib.load(SCALER_PATH)
                print(f"PCOD Scaler loaded from {SCALER_PATH}")
            except Exception as e:
                print(f"Failed to load PCOD scaler: {e}")
        else:
            print(f"PCOD Scaler not found at {SCALER_PATH}")

def predict_pcod(age, bmi, menstrual_irregularity, testosterone, follicles):
    load_pcod_resources()
    
    if _model is None or _scaler is None:
        raise Exception("PCOD Model or Scaler not available")

    # irregular: 1=Yes, 0=No
    # Input array structure based on pcod_test.py:
    # [Age, BMI, Menstrual Irregularity, Testosterone Level, Antral Follicle Count]
    
    input_data = np.array([[
        float(age),
        float(bmi),
        int(menstrual_irregularity),
        float(testosterone),
        float(follicles)
    ]])

    input_scaled = _scaler.transform(input_data)
    
    prediction = _model.predict(input_scaled)[0]
    probability = _model.predict_proba(input_scaled)[0][1] * 100
    
    if probability < 30:
        risk = "Low Risk"
    elif probability < 60:
        risk = "Medium Risk"
    else:
        risk = "High Risk"
        
    return {
        "prediction": "Positive" if prediction == 1 else "Negative",
        "probability": round(probability, 2),
        "risk_level": risk
    }
