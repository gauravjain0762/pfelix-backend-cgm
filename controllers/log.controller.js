const MealScan = require("../models/mealscan.model");
const Activity = require("../models/activity.model");

const getLogs = async (req, res) => {
  try {

    const userId = req.user.id;
    const filter = req.query.filter || "today";

    let startDate = new Date();

    // FILTER LOGIC

    if (filter === "today") {
      startDate.setHours(0,0,0,0);
    }

    if (filter === "week") {
      startDate.setDate(startDate.getDate() - 7);
    }

    if (filter === "month") {
      startDate.setDate(startDate.getDate() - 30);
    }

    // GET MEALS

    const meals = await MealScan.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    const results = [];

    for (const meal of meals) {

      const activity = await Activity.findOne({
        mealScanId: meal._id
      });

      const peak = meal.aiResult?.glucose_prediction?.predicted_peak_mgdl || 0;

      const suggestedSteps = meal.aiResult?.course_correction?.suggested_steps || 0;

      const stepsCompleted = activity?.stepsCompleted || 0;

      const walkStatus = activity?.status || "pending";

      const foods = meal.aiResult?.detected_items || [];

      const mealName = foods.map(f => f.name).join(" + ");

      results.push({

        mealId: meal._id,

        mealType: meal.mealContext?.meal_type || "meal",

        mealName,

        impact: peak,

        suggestedSteps,

        stepsCompleted,

        walkStatus,

        createdAt: meal.createdAt

      });

    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

module.exports = { getLogs };