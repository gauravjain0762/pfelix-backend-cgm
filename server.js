require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth.routes");
const mealscanRoutes = require("./routes/mealscan.routes");
const glucoseRoutes = require("./routes/glucose.routes");
const profileRoutes = require("./routes/profile.routes");
const optionsRoutes = require("./routes/options.routes");
const activityRoutes = require("./routes/activity.routes");
const insightsRoutes = require("./routes/insights.routes");
const logRoutes = require("./routes/log.routes");
const settingsRoutes = require("./routes/settings.routes");

// DB
connectDB();

// Static
app.use("/uploads", express.static("uploads"));

// APIs
app.use("/api/mealscan", mealscanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/glucose", glucoseRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/settings", settingsRoutes);

// ✅ ONLY run locally
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// ✅ REQUIRED for Vercel
module.exports = app;