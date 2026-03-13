const mongoose = require("mongoose");

const mealScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    imageUrl: String,

    userProfile: {
      age_years: Number,
      sex: String,
      height_cm: Number,
      weight_kg: Number,
      hba1c_percent: Number,
      medication: String
    },

    mealContext: {
      meal_type: String,
      region_hint: String
    },

    aiResult: Object

  },
  { timestamps: true }
);

// Auto delete after 30 days
mealScanSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
);

module.exports = mongoose.model("MealScan", mealScanSchema);