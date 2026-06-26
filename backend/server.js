require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({
    origin: [
        "https://opticrop-flame.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/predict", require("./routes/predict"));
app.use("/api/history", require("./routes/history"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/crops", require("./routes/crops"));

app.get("/", (req, res) => res.json({ service: "OptiCrop API", status: "running" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: process.env.NODE_ENV === "development" ? err.message : undefined });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ OptiCrop API running on port ${PORT}`));
