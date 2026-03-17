import os
import sys
from pathlib import Path

# Setup paths similar to Django settings
BASE_DIR = Path(__file__).resolve().parent
# We are in backend/synkria/synkria
# Model is in backend/../ml -> root/ml
# BASE_DIR.parent -> backend/synkria
# BASE_DIR.parent.parent -> backend
# BASE_DIR.parent.parent.parent -> root (synkria)

RESOLVED_ROOT = BASE_DIR.parent.parent.parent
MODEL_PATH = RESOLVED_ROOT / 'ml' / 'lstm_menstrual_cycle_model.h5'

print(f"--- Debugging Model Load ---")
print(f"Script Location: {BASE_DIR}")
print(f"Expected Model Path: {MODEL_PATH}")

if not os.path.exists(MODEL_PATH):
    print(f"[ERROR] Model file DOES NOT exist at expected path.")
    print(f"Please check if 'ml' folder exists in {RESOLVED_ROOT}")
    sys.exit(1)
else:
    print(f"[SUCCESS] Model file found.")

print("Attempting to import TensorFlow...")
try:
    from tensorflow.keras.models import load_model
    print("[SUCCESS] TensorFlow imported.")
except ImportError as e:
    print(f"[ERROR] TensorFlow import failed: {e}")
    print("Try running: pip install tensorflow")
    sys.exit(1)
except Exception as e:
    print(f"[ERROR] Unexpected error importing TensorFlow: {e}")
    sys.exit(1)

print("Attempting to load model...")
try:
    model = load_model(str(MODEL_PATH), compile=False)
    print("[SUCCESS] Model loaded successfully!")
except Exception as e:
    print(f"[ERROR] Model load failed: {e}")

print("--- End Debug ---")
