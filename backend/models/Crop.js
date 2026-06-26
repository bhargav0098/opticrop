const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" },
  idealConditions: {
    N: { type: String, default: "" },
    P: { type: String, default: "" },
    K: { type: String, default: "" },
    temperature: { type: String, default: "" },
    humidity: { type: String, default: "" },
    ph: { type: String, default: "" },
    rainfall: { type: String, default: "" }
  },
  imageUrl: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Crop", cropSchema);
