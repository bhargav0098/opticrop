import pandas as pd
import numpy as np
import os

print("=== Epic 3 - Task: Data Pre-processing ===")

# Define paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

try:
    import kagglehub
    from kagglehub import KaggleDatasetAdapter
    print("Loading dataset for preprocessing...")
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "chitrakumari25/smart-agricultural-production-optimizing-engine",
        "Crop_recommendation.csv",
    )
except Exception as e:
    print(f"[WARN] Could not load dataset via kagglehub: {e}")
    # Create fallback dataset
    np.random.seed(42)
    df = pd.DataFrame({
        "N": np.random.randint(0, 140, 100),
        "P": np.random.randint(5, 145, 100),
        "K": np.random.randint(5, 205, 100),
        "temperature": np.random.uniform(8, 43, 100),
        "humidity": np.random.uniform(14, 99, 100),
        "ph": np.random.uniform(3.5, 9.9, 100),
        "rainfall": np.random.uniform(20, 298, 100),
        "label": np.random.choice(["rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate", "banana", "mango", "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya", "coconut", "cotton", "jute", "coffee"], 100)
    })

# 1. Checking for Null Values
print("\n--- Checking for Null Values ---")
print(df.isnull().sum())
df = df.dropna()
print("After removing nulls, shape:", df.shape)

# 2. Handling Outliers (Using IQR method on continuous features)
print("\n--- Handling Outliers ---")
features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
for col in features:
    if col in df.columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)].shape[0]
        # Cap outliers
        df[col] = np.where(df[col] < lower_bound, lower_bound, df[col])
        df[col] = np.where(df[col] > upper_bound, upper_bound, df[col])
        print(f"{col}: Capped {outliers} outliers.")

# 3. Extracting Seasonal Crops
print("\n--- Extracting Seasonal Crops ---")
summer_crops = ['maize', 'pigeonpeas', 'mothbeans', 'mungbean', 'blackgram', 'cotton', 'jute', 'papaya']
winter_crops = ['chickpea', 'kidneybeans', 'lentil', 'pomegranate', 'wheat', 'apple']
rainy_crops = ['rice', 'banana', 'coconut']

def get_season(crop):
    if crop in summer_crops: return 'Summer'
    if crop in winter_crops: return 'Winter'
    if crop in rainy_crops: return 'Rainy'
    return 'All Season'

if 'label' in df.columns:
    df['season'] = df['label'].apply(get_season)
    print("Season distribution:")
    print(df['season'].value_counts())

# 4. Splitting Data into Train and Test Sets
print("\n--- Splitting Data into Train and Test Sets ---")
from sklearn.model_selection import train_test_split
X = df.drop(columns=['label', 'season'], errors='ignore')
y = df['label'] if 'label' in df.columns else None

if y is not None:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"Train set shape: {X_train.shape}")
    print(f"Test set shape: {X_test.shape}")

# Save the preprocessed dataset
cleaned_path = os.path.join(DATA_DIR, "crop_cleaned.csv")
df.to_csv(cleaned_path, index=False)
print(f"\n[OK] Saved preprocessed dataset to: {cleaned_path}")
print("=== Pre-processing Complete ===")
