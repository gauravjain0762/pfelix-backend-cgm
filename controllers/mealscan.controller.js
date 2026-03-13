const MealScan = require("../models/mealscan.model");
const analyzeMeal = require("../services/openai.service");

const predictMeal = async (req, res) => {
  try {

    const userId = req.user.id;

    const { user_profile, meal_context } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Meal image required"
      });
    }

    // DAILY LIMIT CHECK

    const today = new Date();
    today.setHours(0,0,0,0);

    const scansToday = await MealScan.countDocuments({
      userId,
      createdAt: { $gte: today }
    });

    if (scansToday >= 4) {
      return res.status(429).json({
        success: false,
        message: "Daily scan limit reached (4 scans per day)"
      });
    }

    const imageUrl = req.file.path; //cloudinary url

    const userProfile = JSON.parse(user_profile);
    const mealContext = JSON.parse(meal_context);

    // CALL AI

    const aiResult = await analyzeMeal(
      imageUrl,
      userProfile,
      mealContext
    );

    // SAVE SCAN

    const mealScan = new MealScan({
      userId,
      imageUrl,
      userProfile,
      mealContext,
      aiResult
    });

    await mealScan.save();

    res.json({
      success: true,
      data: mealScan
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

const getHistory = async (req, res) => {
  try {
    const scans = await MealScan
    .find({ userId: req.user.id})
    .sort({ createdAt: -1 })
    .limit(30);

    res.json({
      success: true,
      data: scans
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message: "Server error"
    });
  }
};

const getSingleScan = async ( req, res ) => {
  try{
    const scan =await MealScan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found"
      });
    }

    res.json({
      success:true,
      data: scan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const deleteScan = async ( req, res ) => {
  try{
    const scan =await MealScan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found"
      });
    }

    res.json({
      success:true,
      message: "Scan deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = { 
  predictMeal,
  getHistory,
  getSingleScan,
  deleteScan
};