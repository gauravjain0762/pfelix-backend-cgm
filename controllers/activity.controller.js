const Activity = require("../models/activity.model");
const MealScan = require("../models/mealscan.model");

const startWalking = async (req, res) => {

    try{
        const { mealScanId } = req.body;

        const mealScan = await MealScan.findById(mealScanId);

        if (!mealScan) {
            return res.status(404).json({
                success: false,
                message: "Meal scan not found"
            });
        }

        const suggestedSteps = mealScan.aiResult.course_correction.suggested_steps;

        const now = new Date();

        const activity = new Activity({
            userId: req.user.id,
            mealScanId,
            suggestedSteps,
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

    // check expiry

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

module.exports = { startWalking, updateSteps, getCurrentActivity };