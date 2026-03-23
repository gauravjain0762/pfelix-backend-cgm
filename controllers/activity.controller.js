const Activity = require("../models/activity.model");
const MealScan = require("../models/mealscan.model");

const startWalking = async (req, res) => {
  try {
    const { mealScanId } = req.body;

    const mealScan = await MealScan.findById(mealScanId);

    if (!mealScan) {
      return res.status(404).json({
        success: false,
        message: "Meal scan not found"
      });
    }

    const suggestedSteps =
      mealScan.aiResult.course_correction.suggested_steps;

    const now = new Date();

    const activity = new Activity({
      userId: req.user.id,
      mealScanId,
      suggestedSteps,
      stepsCompleted: 0,
      status: "active",
      startedAt: now,
      expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000)
    });

    await activity.save();

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateSteps = async (req, res) => {
  try {
    const { activityId, steps } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    if (activity.status !== "active") {
      return res.json({
        success: false,
        message: "Activity already finished"
      });
    }

    // expiry check
    if (new Date() > activity.expiresAt) {
      activity.status = "expired";
      await activity.save();

      return res.json({
        success: false,
        message: "Activity expired"
      });
    }

    activity.stepsCompleted = steps;

    if (steps >= activity.suggestedSteps) {
      activity.stepsCompleted = activity.suggestedSteps;
      activity.status = "completed";
    }

    await activity.save();

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getCurrentActivity = async (req, res) => {
  const activity = await Activity.findOne({
    userId: req.user.id,
    status: "active"
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: activity
  });
};


// 🚀 NEW STATUS API
const getActivityStatus = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    if (!activity) {
      return res.json({
        success: false,
        message: "No activity found"
      });
    }

    const now = new Date();

    // ✅ auto expire
    if (activity.status === "active" && now > activity.expiresAt) {
      activity.status = "expired";
      await activity.save();
    }

    const totalSteps = activity.suggestedSteps || 0;
    const completedSteps = activity.stepsCompleted || 0;

    const remainingSteps = Math.max(totalSteps - completedSteps, 0);

    const progress =
      totalSteps > 0
        ? Math.min((completedSteps / totalSteps) * 100, 100)
        : 0;

    const timeLeftMs = activity.expiresAt - now;

    const timeLeftMinutes =
      timeLeftMs > 0 ? Math.floor(timeLeftMs / (1000 * 60)) : 0;

    res.json({
      success: true,
      data: {
        status: activity.status,
        suggestedSteps: totalSteps,
        stepsCompleted: completedSteps,
        remainingSteps,
        progress: Math.round(progress),
        timeLeftMinutes
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  startWalking,
  updateSteps,
  getCurrentActivity,
  getActivityStatus
};