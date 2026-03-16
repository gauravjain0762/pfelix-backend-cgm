require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes")

const mealscanRoutes = require("./routes/mealscan.routes");

const glucoseRoutes = require("./routes/glucose.routes");

const profileRoutes = require("./routes/profile.routes");

const optionsRoutes = require("./routes/options.routes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/mealscan", mealscanRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/glucose", glucoseRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/options", optionsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});