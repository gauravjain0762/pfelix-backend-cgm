const User = require("../models/user.model");

const updateNotifications = async (req, res) => {
  try {

    const userId = req.user.id;

    const { postMealWalkReminder } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "notifications.postMealWalkReminder": postMealWalkReminder
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      notifications: user.notifications
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

module.exports = { updateNotifications };