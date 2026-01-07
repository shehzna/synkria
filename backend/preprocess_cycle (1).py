import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import joblib
import os

# ---------------------------------------------
# CONFIG
# ---------------------------------------------
DATA_PATH = r"C:\Nextgen\SynKria\data\Menstrual Cycle\menstrual_cycle_dataset_with_factors.csv"
SAVE_DIR = r"C:\Nextgen\SynKria\data\Menstrual Cycle\processed"
SEQ_LENGTH = 30  # LSTM window size



def load_data(path):
    df = pd.read_csv(path)
    print("Dataset Loaded:", df.shape)
    return df



def clean_data(df):
    # Parse dates
    df["Cycle Start Date"] = pd.to_datetime(df["Cycle Start Date"], errors='coerce')
    df["Next Cycle Start Date"] = pd.to_datetime(df["Next Cycle Start Date"], errors='coerce')

    # Sort by date
    df = df.sort_values("Cycle Start Date")

    # Fill missing values
    df = df.ffill().bfill()

    return df



def encode_all_categoricals(df):

    label_encoders = {}

    for col in df.columns:
        if df[col].dtype == "object":
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            label_encoders[col] = le

    print("Categorical columns encoded.")
    return df, label_encoders



def scale_all_numeric(df):
    scaler = MinMaxScaler()

    # EXACT 9 numeric features (NO USER ID)
    numeric_cols = [
        "Age",
        "BMI",
        "Stress Level",
        "Exercise Frequency",
        "Sleep Hours",
        "Diet",
        "Symptoms",
        "Cycle Length",
        "Period Length"
    ]

    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])

    return df, scaler



def create_sequences(df, seq_len=30):

    # Remove columns not useful for LSTM
    df_model = df.drop(columns=["User ID", "Cycle Start Date", "Next Cycle Start Date"])

    target_col = "Cycle Length"

    data = df_model.values
    targets = df_model[target_col].values

    X, y = [], []

    for i in range(len(df_model) - seq_len):
        X.append(data[i:i + seq_len])          # past 30 days
        y.append(targets[i + seq_len])         # predict next cycle length

    X, y = np.array(X), np.array(y)

    print("Sequence Shape:", X.shape, y.shape)
    return X, y



def save_processed(X, y, scaler):

    os.makedirs(SAVE_DIR, exist_ok=True)

    np.save(os.path.join(SAVE_DIR, "X.npy"), X)
    np.save(os.path.join(SAVE_DIR, "y.npy"), y)

    # save scaler
    joblib.dump(scaler, os.path.join(SAVE_DIR, "scaler.pkl"))
    print("Scaler saved to scaler.pkl")

    print("Saved processed sequences!")


def preprocess_cycle():

    df = load_data(DATA_PATH)
    df = clean_data(df)
    df, encoders = encode_all_categoricals(df)
    df, scaler = scale_all_numeric(df)
    X, y = create_sequences(df, SEQ_LENGTH)
    save_processed(X, y, scaler)

    print("Preprocessing Completed Successfully!")


if __name__ == "__main__":
    preprocess_cycle()
