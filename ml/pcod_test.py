import joblib
import numpy as np


model = joblib.load("pcos_model.pkl")
scaler = joblib.load("scaler.pkl")


new_data = np.array([[  
    26,     # Age
    29.5,   # BMI
    1,      # Menstrual Irregularity (1=Yes, 0=No)
    68.2,   # Testosterone Level
    18      # Antral Follicle Count
]])


new_data_scaled = scaler.transform(new_data)


prediction = model.predict(new_data_scaled)[0]
probability = model.predict_proba(new_data_scaled)[0][1] * 100


if probability < 30:
    risk = "Low Risk"
elif probability < 60:
    risk = "Medium Risk"
else:
    risk = "High Risk"


print("PCOS Prediction:", "Positive" if prediction == 1 else "Negative")
print(f"Risk Probability: {probability:.2f}%")
print("Risk Level:", risk)
