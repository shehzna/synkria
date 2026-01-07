import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# 1. Load the dataset
# Replace 'dataset.csv' with your actual filename
df = pd.read_csv('dataset.csv')

print("Initial Data Info:")
print(df.info())

# 2. Handle Missing Values
# Option A: Drop rows with missing values
# df = df.dropna()
# Option B: Fill with mean (for numerical)
df.fillna(df.mean(numeric_only=True), inplace=True)

# 3. Encode Categorical Data (if any)
# Use LabelEncoder for targets or OneHotEncoding for features
le = LabelEncoder()
for col in df.select_dtypes(include=['object']).columns:
    df[col] = le.fit_transform(df[col])

# 4. Feature Scaling
scaler = StandardScaler()
# Assuming the last column is the label/target
X = df.iloc[:, :-1]
y = df.iloc[:, -1]

X_scaled = scaler.fit_transform(X)

# 5. Split the Data
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

print("\nPreprocessing Complete.")
print(f"Training shape: {X_train.shape}")