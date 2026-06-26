const router = require("express").Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const PredictionHistory = require("../models/PredictionHistory");

// GET /api/profile
router.get("/", protect, async (req, res) => {
  try {
    const totalPredictions = await PredictionHistory.countDocuments({ userId: req.user._id });
    const recentCrops = await PredictionHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(3).select("predictedCrop confidence createdAt");
    res.json({ user: req.user, totalPredictions, recentCrops });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// PUT /api/profile
router.put("/", protect, async (req, res) => {
  try {
    const { name, farmLocation, farmSize } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, farmLocation, farmSize },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
});

module.exports = router;
