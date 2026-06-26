from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pickle, json, os
import numpy as np
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

app = FastAPI(title="OptiCrop ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "crop_model.pkl")
REPORT_PATH = os.path.join(os.path.dirname(__file__), "model", "accuracy_report.json")

try:
    with open(MODEL_PATH, "rb") as f:
        bundle = pickle.load(f)
    model = bundle["model"]
    scaler = bundle["scaler"]
    le = bundle["label_encoder"]
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Model load error: {e}")
    model = scaler = le = None

try:
    with open(REPORT_PATH) as f:
        accuracy_report = json.load(f)
except:
    accuracy_report = {}

CROP_INFO = {
    "rice":        {"soil": "Clay or loamy soil", "climate": "Hot & humid tropical", "tip": "Maintain flooded conditions during growth. Harvest when 80% of grains are straw-colored."},
    "wheat":       {"soil": "Well-drained loamy soil", "climate": "Cool & dry temperate", "tip": "Sow at correct depth (3–5 cm). Irrigate at crown root initiation stage."},
    "maize":       {"soil": "Sandy loam to loamy", "climate": "Warm with moderate rainfall", "tip": "Plant in rows 60–75 cm apart. Ensure nitrogen top-dressing at knee-height stage."},
    "chickpea":    {"soil": "Sandy loam to clay loam", "climate": "Cool & dry", "tip": "Inoculate seeds with Rhizobium before planting to fix nitrogen naturally."},
    "kidneybeans": {"soil": "Loamy well-drained", "climate": "Warm & moist", "tip": "Avoid waterlogging. Stake plants to support growth."},
    "pigeonpeas":  {"soil": "Sandy loam to clay", "climate": "Semi-arid tropical", "tip": "Intercrop with cereals for maximum efficiency."},
    "mothbeans":   {"soil": "Sandy loam", "climate": "Arid & hot", "tip": "Drought tolerant — ideal for dry regions with low rainfall."},
    "mungbean":    {"soil": "Loamy to sandy loam", "climate": "Warm & humid", "tip": "Short duration crop (60–90 days). Excellent for crop rotation."},
    "blackgram":   {"soil": "Loamy soil", "climate": "Warm & humid", "tip": "Rich in protein. Grows well after rice harvest (kharif season)."},
    "lentil":      {"soil": "Loamy well-drained", "climate": "Cool & dry", "tip": "Deep ploughing improves yields. Use certified disease-resistant varieties."},
    "pomegranate": {"soil": "Sandy loam to loamy", "climate": "Semi-arid, drought tolerant", "tip": "Prune regularly. Apply potassium-rich fertilizer before flowering."},
    "banana":      {"soil": "Rich loamy soil", "climate": "Tropical humid", "tip": "Requires frequent irrigation. Remove dead leaves to prevent disease."},
    "mango":       {"soil": "Sandy loam to clay loam", "climate": "Tropical & subtropical", "tip": "Grafted varieties bear fruit in 3–4 years vs 6–8 for seedlings."},
    "grapes":      {"soil": "Sandy loam to clay loam", "climate": "Warm Mediterranean", "tip": "Train on trellis system. Prune canes in winter for better yield."},
    "watermelon":  {"soil": "Sandy loam", "climate": "Hot & dry", "tip": "Requires warm soil (>21°C). Space plants 1.5–2 m apart."},
    "muskmelon":   {"soil": "Sandy loam well-drained", "climate": "Hot & dry", "tip": "Reduce irrigation as fruit ripens to increase sweetness."},
    "apple":       {"soil": "Well-drained loamy", "climate": "Cold & temperate", "tip": "Requires chilling hours below 7°C. Cross-pollination with compatible variety boosts yield."},
    "orange":      {"soil": "Sandy loam to loamy", "climate": "Subtropical warm", "tip": "Apply zinc sulfate to prevent deficiency. Irrigate deeply but infrequently."},
    "papaya":      {"soil": "Sandy loam well-drained", "climate": "Tropical warm", "tip": "Papaya is fast-growing. Harvest when skin turns yellow-green."},
    "coconut":     {"soil": "Sandy coastal loam", "climate": "Tropical coastal humid", "tip": "Apply potassium-rich fertilizer. Intercrop with turmeric or ginger."},
    "cotton":      {"soil": "Black cotton soil or clay loam", "climate": "Warm & dry with bright sunshine", "tip": "Use Bt cotton for pest resistance. Thin plants to one per hill."},
    "jute":        {"soil": "Sandy loam to clay loam", "climate": "Hot & humid tropical", "tip": "Retting quality fiber requires clean water. Harvest at 50% flowering."},
}

class CropInput(BaseModel):
    N: float = Field(..., ge=0, le=300, description="Nitrogen content")
    P: float = Field(..., ge=0, le=300, description="Phosphorus content")
    K: float = Field(..., ge=0, le=300, description="Potassium content")
    temperature: float = Field(..., ge=-10, le=60)
    humidity: float = Field(..., ge=0, le=100)
    ph: float = Field(..., ge=0, le=14)
    rainfall: float = Field(..., ge=0, le=500)

class AnalysisInput(BaseModel):
    crop: str
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.get("/")
def root():
    return {"service": "OptiCrop ML API", "status": "running", "model": accuracy_report.get("best_model"), "accuracy": accuracy_report.get("best_accuracy")}

@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}

@app.get("/predict")
def predict_get():
    return {
        "message": "Use POST method to send prediction data.",
        "method": "POST",
        "url": "/predict",
        "content_type": "application/json",
        "example_body": {
            "N": 90,
            "P": 42,
            "K": 43,
            "temperature": 25,
            "humidity": 80,
            "ph": 6.5,
            "rainfall": 200
        },
        "hint": "Send a POST request with the above JSON body to get a crop recommendation."
    }

@app.post("/predict")
def predict(data: CropInput):
    if model is None:
        raise HTTPException(503, "Model not loaded")
    features = np.array([[data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall]])
    features_scaled = scaler.transform(features)
    
    pred_idx = model.predict(features_scaled)[0]
    crop_name = le.inverse_transform([pred_idx])[0]
    
    # Confidence from probability
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features_scaled)[0]
        confidence = round(float(proba[pred_idx]) * 100, 1)
        top3_idx = np.argsort(proba)[::-1][:3]
        alternatives = [{"crop": le.inverse_transform([i])[0], "confidence": round(float(proba[i])*100,1)} for i in top3_idx[1:]]
    else:
        confidence = 85.0
        alternatives = []

    info = CROP_INFO.get(crop_name, {"soil": "Varies", "climate": "Varies", "tip": "Consult local agriculture extension."})
    
    return {
        "crop": crop_name,
        "confidence": confidence,
        "soil_requirement": info["soil"],
        "climate": info["climate"],
        "farming_tip": info["tip"],
        "alternatives": alternatives,
    }

@app.post("/analyze")
def analyze(data: AnalysisInput):
    crop = data.crop.lower().strip()
    if crop not in CROP_INFO:
        raise HTTPException(400, f"Crop '{data.crop}' not in database")

    # Define ideal ranges per crop (simplified)
    profiles = {
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

    p = profiles.get(crop, {})
    checks = {}
    score = 0
    total = 0

    def check(val, rng, name):
        nonlocal score, total
        total += 1
        lo, hi = rng
        ok = lo <= val <= hi
        if ok: score += 1
        margin = (hi - lo) * 0.15
        status = "✅ Suitable" if ok else ("⚠️ Marginal" if (lo-margin) <= val <= (hi+margin) else "❌ Not Suitable")
        checks[name] = {"value": val, "ideal": f"{lo}–{hi}", "status": status}

    if p:
        check(data.N, p["N"], "Nitrogen")
        check(data.P, p["P"], "Phosphorus")
        check(data.K, p["K"], "Potassium")
        check(data.temperature, p["temp"], "Temperature (°C)")
        check(data.humidity, p["hum"], "Humidity (%)")
        check(data.ph, p["ph"], "pH Level")
        check(data.rainfall, p["rain"], "Rainfall (mm)")

    pct = (score / total * 100) if total else 0
    suitability = "High" if pct >= 70 else ("Medium" if pct >= 45 else "Low")

    return {
        "crop": data.crop,
        "suitability": suitability,
        "score": round(pct, 1),
        "checks": checks,
        "soil_info": CROP_INFO[crop]["soil"],
        "climate_info": CROP_INFO[crop]["climate"],
        "tip": CROP_INFO[crop]["tip"],
    }

@app.get("/crops")
def list_crops():
    return {"crops": list(CROP_INFO.keys()), "count": len(CROP_INFO)}

@app.get("/model-info")
def model_info():
    return accuracy_report
