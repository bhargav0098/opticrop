import pickle
import numpy as np
import os
import sys

def predict_crop(N, P, K, temperature, humidity, ph, rainfall):
    model_path = os.path.join(os.path.dirname(__file__), "model", "crop_model.pkl")
    
    if not os.path.exists(model_path):
        print("Error: Model not found. Please run train.py first.")
        return None
        
    with open(model_path, "rb") as f:
        bundle = pickle.load(f)
        
    model = bundle["model"]
    scaler = bundle["scaler"]
    le = bundle["label_encoder"]
    
    features = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    features_scaled = scaler.transform(features)
    
    pred_idx = model.predict(features_scaled)[0]
    crop_name = le.inverse_transform([pred_idx])[0]
    
    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features_scaled)[0]
        confidence = round(float(proba[pred_idx]) * 100, 2)
    else:
        confidence = 100.0
        
    return {"crop": crop_name, "confidence": f"{confidence}%"}

if __name__ == "__main__":
    if len(sys.argv) == 8:
        inputs = [float(x) for x in sys.argv[1:8]]
        result = predict_crop(*inputs)
        print(f"Predicted Crop: {result['crop']} (Confidence: {result['confidence']})")
    else:
        print("Usage: python predict.py <N> <P> <K> <temperature> <humidity> <ph> <rainfall>")
        # Example test
        res = predict_crop(90, 42, 43, 20.8, 82.0, 6.5, 202.9)
        if res:
            print(f"Test Result: {res}")
