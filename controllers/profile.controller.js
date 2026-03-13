const User = require("../models/user.model");
const calculateCalories = require("../utils/calorieCalculator");

const setupProfile = async (req, res) => {
  try {

    console.log("USER ID:", req.user);

    const userId = req.user.id;

    const profile = req.body;

    // calculate BMI if missing
    if (!profile.bmi) {
      const heightMeters = profile.height / 100;
      profile.bmi = profile.weight / (heightMeters * heightMeters);
    }

    const result = calculateCalories(profile);

    const updatedUser = await User.findByIdAndUpdate(
  userId,
  {
    $set: {
      userProfile: {
        ...profile,
        dailyCalories: result.dailyCalories
      }
    }
  },
  { new: true, runValidators: true }
);

console.log("UPDATED USER:", updatedUser);

    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          userProfile: {
            ...profile,
            dailyCalories: result.dailyCalories
          }
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      dailyCalories: result.dailyCalories,
      mealBudget: result.mealBudget
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

    const getProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const dailyCalories = user.userProfile.dailyCalories;

    res.json({
      success: true,
      profile: user.userProfile,
      mealBudget: {
        breakfast: Math.round(dailyCalories * 0.25),
        lunch: Math.round(dailyCalories * 0.35),
        snack: Math.round(dailyCalories * 0.10),
        dinner: Math.round(dailyCalories * 0.30)
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

module.exports = { setupProfile, getProfile };