import pandas as pd
import numpy as np
import json
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, classification_report

print("=== OptiCrop ML Training Pipeline ===")

# --- Generate synthetic crop dataset ---
np.random.seed(42)
n = 2200

crop_profiles = {
    "rice":        dict(N=(60,100),  P=(30,60),   K=(30,60),   temp=(20,28), hum=(75,90), ph=(5.5,7.0), rain=(150,250)),
    "wheat":       dict(N=(80,120),  P=(35,65),   K=(35,65),   temp=(10,22), hum=(40,65), ph=(6.0,7.5), rain=(60,120)),
    "maize":       dict(N=(70,110),  P=(35,65),   K=(35,65),   temp=(18,28), hum=(55,75), ph=(5.8,7.5), rain=(80,160)),
    "chickpea":    dict(N=(20,50),   P=(50,90),   K=(60,100),  temp=(15,25), hum=(25,55), ph=(6.0,8.0), rain=(40,100)),
    "kidneybeans": dict(N=(15,40),   P=(60,100),  K=(15,40),   temp=(18,26), hum=(55,75), ph=(5.5,7.5), rain=(100,180)),
    "pigeonpeas":  dict(N=(15,40),   P=(50,90),   K=(15,40),   temp=(20,30), hum=(45,65), ph=(6.0,7.5), rain=(60,130)),
    "mothbeans":   dict(N=(15,40),   P=(40,80),   K=(15,40),   temp=(24,34), hum=(25,50), ph=(6.0,7.5), rain=(30,80)),
    "mungbean":    dict(N=(15,40),   P=(40,80),   K=(15,40),   temp=(25,35), hum=(55,80), ph=(6.0,7.5), rain=(50,100)),
    "blackgram":   dict(N=(30,60),   P=(50,90),   K=(15,40),   temp=(22,32), hum=(60,80), ph=(6.0,7.5), rain=(80,150)),
    "lentil":      dict(N=(15,40),   P=(50,90),   K=(15,40),   temp=(14,24), hum=(40,65), ph=(5.5,7.5), rain=(40,100)),
    "pomegranate": dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(22,32), hum=(40,65), ph=(5.5,7.5), rain=(30,90)),
    "banana":      dict(N=(80,120),  P=(60,100),  K=(40,80),   temp=(22,30), hum=(70,90), ph=(5.5,7.0), rain=(100,200)),
    "mango":       dict(N=(15,40),   P=(10,30),   K=(20,50),   temp=(24,34), hum=(40,70), ph=(5.5,7.5), rain=(50,150)),
    "grapes":      dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(16,28), hum=(55,80), ph=(6.0,7.5), rain=(50,120)),
    "watermelon":  dict(N=(80,120),  P=(30,60),   K=(40,80),   temp=(25,35), hum=(70,85), ph=(6.0,7.5), rain=(60,120)),
    "muskmelon":   dict(N=(80,120),  P=(30,60),   K=(50,90),   temp=(28,36), hum=(65,80), ph=(6.0,7.5), rain=(40,90)),
    "apple":       dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(6,14),  hum=(55,75), ph=(5.5,7.0), rain=(80,160)),
    "orange":      dict(N=(15,40),   P=(10,30),   K=(20,50),   temp=(18,28), hum=(55,75), ph=(6.0,7.5), rain=(80,160)),
    "papaya":      dict(N=(40,80),   P=(10,30),   K=(40,80),   temp=(25,35), hum=(70,85), ph=(5.5,7.0), rain=(100,200)),
    "coconut":     dict(N=(15,40),   P=(10,30),   K=(30,70),   temp=(22,32), hum=(70,90), ph=(5.5,8.0), rain=(120,250)),
    "cotton":      dict(N=(100,140), P=(35,65),   K=(15,40),   temp=(22,32), hum=(55,75), ph=(6.0,8.0), rain=(60,130)),
    "jute":        dict(N=(70,110),  P=(40,80),   K=(35,65),   temp=(22,32), hum=(70,90), ph=(6.0,7.5), rain=(150,250)),
}

rows = []
per_crop = n // len(crop_profiles)
for crop, p in crop_profiles.items():
    for _ in range(per_crop):
        rows.append({
            "N":           np.random.randint(*p["N"]),
            "P":           np.random.randint(*p["P"]),
            "K":           np.random.randint(*p["K"]),
            "temperature": round(np.random.uniform(*p["temp"]), 2),
            "humidity":    round(np.random.uniform(*p["hum"]), 2),
            "ph":          round(np.random.uniform(*p["ph"]), 2),
            "rainfall":    round(np.random.uniform(*p["rain"]), 2),
            "label":       crop,
        })

df = pd.DataFrame(rows)
print(f"Dataset shape: {df.shape}")
print(f"Crops: {df['label'].nunique()}")

# --- Preprocessing ---
X = df[["N","P","K","temperature","humidity","ph","rainfall"]]
y = df["label"]

le = LabelEncoder()
y_enc = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

# --- Train models ---
models = {
    "Random Forest":     RandomForestClassifier(n_estimators=100, random_state=42),
    "Decision Tree":     DecisionTreeClassifier(random_state=42),
    "KNN":               KNeighborsClassifier(n_neighbors=5),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
}

results = {}
best_name, best_acc, best_model = "", 0, None

for name, model in models.items():
    model.fit(X_train_s, y_train)
    acc = accuracy_score(y_test, model.predict(X_test_s))
    results[name] = round(acc * 100, 2)
    print(f"  {name}: {acc*100:.2f}%")
    if acc > best_acc:
        best_acc, best_name, best_model = acc, name, model

print(f"\nBest model: {best_name} ({best_acc*100:.2f}%)")

# KMeans (unsupervised, info only)
km = KMeans(n_clusters=len(crop_profiles), random_state=42, n_init=10)
km.fit(X_train_s)
results["K-Means (clustering)"] = "N/A (unsupervised)"

# --- Save artifacts ---
os.makedirs("model", exist_ok=True)
with open("model/crop_model.pkl", "wb") as f:
    pickle.dump({"model": best_model, "scaler": scaler, "label_encoder": le}, f)

report = {
    "best_model": best_name,
    "best_accuracy": round(best_acc * 100, 2),
    "all_models": results,
    "crops": list(le.classes_),
    "features": ["N","P","K","temperature","humidity","ph","rainfall"],
}
with open("model/accuracy_report.json", "w") as f:
    json.dump(report, f, indent=2)

print("\nSaved: model/crop_model.pkl")
print("Saved: model/accuracy_report.json")
print("=== Training complete ===")
