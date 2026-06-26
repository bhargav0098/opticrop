const router = require("express").Router();
const axios = require("axios");
const { protect } = require("../middleware/auth");
const PredictionHistory = require("../models/PredictionHistory");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// POST /api/predict
router.post("/", protect, async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

    // Validate
    const fields = { N, P, K, temperature, humidity, ph, rainfall };
    for (const [key, val] of Object.entries(fields)) {
      if (val === undefined || val === null || val === "") {
        return res.status(400).json({ message: `Field '${key}' is required` });
      }
      if (isNaN(Number(val))) {
        return res.status(400).json({ message: `Field '${key}' must be a number` });
      }
    }

    // Call ML service
    const mlRes = await axios.post(`${ML_URL}/predict`, {
      N: Number(N), P: Number(P), K: Number(K),
      temperature: Number(temperature), humidity: Number(humidity),
      ph: Number(ph), rainfall: Number(rainfall),
    }, { timeout: 15000 });

    const prediction = mlRes.data;

    // Save to history
    const history = await PredictionHistory.create({
      userId: req.user._id,
      inputParameters: { N: Number(N), P: Number(P), K: Number(K), temperature: Number(temperature), humidity: Number(humidity), ph: Number(ph), rainfall: Number(rainfall) },
      predictedCrop: prediction.crop,
      confidence: prediction.confidence,
      soilRequirement: prediction.soil_requirement,
      climate: prediction.climate,
      farmingTip: prediction.farming_tip,
      alternatives: prediction.alternatives || [],
    });

    res.json({ ...prediction, historyId: history._id });
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
      return res.status(503).json({ message: "ML service unavailable. Please try again later." });
    }
    res.status(500).json({ message: "Prediction failed", error: err.message });
  }
});

// POST /api/predict/analyze
router.post("/analyze", protect, async (req, res) => {
  try {
    const mlRes = await axios.post(`${ML_URL}/analyze`, req.body, { timeout: 15000 });
    res.json(mlRes.data);
  } catch (err) {
    if (err.response) return res.status(err.response.status).json(err.response.data);
    res.status(503).json({ message: "ML service error" });
  }
});

module.exports = router;
