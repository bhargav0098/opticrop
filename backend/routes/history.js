const router = require("express").Router();
const { protect } = require("../middleware/auth");
const PredictionHistory = require("../models/PredictionHistory");

// GET /api/history
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      PredictionHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PredictionHistory.countDocuments({ userId: req.user._id }),
    ]);

    res.json({ history, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching history" });
  }
});

// DELETE /api/history/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await PredictionHistory.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting record" });
  }
});

module.exports = router;
