const router = require("express").Router();
const axios = require("axios");
const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

router.get("/", async (req, res) => {
  try {
    const r = await axios.get(`${ML_URL}/crops`, { timeout: 5000 });
    res.json(r.data);
  } catch {
    res.json({ crops: ["rice","wheat","maize","chickpea","kidneybeans","pigeonpeas","mothbeans","mungbean","blackgram","lentil","pomegranate","banana","mango","grapes","watermelon","muskmelon","apple","orange","papaya","coconut","cotton","jute"] });
  }
});

module.exports = router;
