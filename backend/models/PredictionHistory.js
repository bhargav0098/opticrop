const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  inputParameters: {
    N: Number, P: Number, K: Number,
    temperature: Number, humidity: Number,
    ph: Number, rainfall: Number,
  },
  predictedCrop: { type: String, required: true },
  confidence: { type: Number, required: true },
  soilRequirement: String,
  climate: String,
  farmingTip: String,
  alternatives: [{ crop: String, confidence: Number }],
}, { timestamps: true });

module.exports = mongoose.model("PredictionHistory", predictionSchema);
