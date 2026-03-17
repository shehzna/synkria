import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.optimizers import Adam


df = pd.read_csv("FedCycleData071012 (2).csv")

df = df[["ClientID", "CycleNumber", "LengthofCycle"]]


df["LengthofCycle"] = pd.to_numeric(df["LengthofCycle"], errors="coerce")


df = df.dropna()


df = df.sort_values(["ClientID", "CycleNumber"])

print("Data loaded:", df.shape)


SEQUENCE_LENGTH = 3   # last 3 cycles → predict next

X = []
y = []

for _, group in df.groupby("ClientID"):
    cycles = group["LengthofCycle"].values

    if len(cycles) > SEQUENCE_LENGTH:
        for i in range(len(cycles) - SEQUENCE_LENGTH):
            X.append(cycles[i:i + SEQUENCE_LENGTH])
            y.append(cycles[i + SEQUENCE_LENGTH])

X = np.array(X)
y = np.array(y)

print("Before reshape:", X.shape)


X = X.reshape((X.shape[0], X.shape[1], 1))

print("After reshape:", X.shape)


X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)


model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(SEQUENCE_LENGTH, 1)),
    Dropout(0.2),
    LSTM(32),
    Dense(1)
])

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="mse",
    metrics=["mae"]
)

model.summary()

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=5,
    restore_best_weights=True
)

history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=50,
    batch_size=16,
    callbacks=[early_stop],
    verbose=1
)


preds = model.predict(X_test).flatten()
mae = mean_absolute_error(y_test, preds)

print("\n✅ LSTM MAE (days):", round(mae, 2))


model.save("lstm_menstrual_cycle_model.h5")
print("✅ Model saved as lstm_menstrual_cycle_model.h5")


def predict_next_cycle(client_id):
    user_cycles = df[df["ClientID"] == client_id]["LengthofCycle"].values

    if len(user_cycles) < SEQUENCE_LENGTH:
        return None

    last_seq = user_cycles[-SEQUENCE_LENGTH:]
    last_seq = last_seq.reshape((1, SEQUENCE_LENGTH, 1))

    prediction = model.predict(last_seq)[0][0]
    return round(prediction)


example_user = df["ClientID"].iloc[0]
print(f"Predicted next cycle for {example_user}:",
      predict_next_cycle(example_user), "days")