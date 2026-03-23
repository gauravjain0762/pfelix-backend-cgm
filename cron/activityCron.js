const connectDB = require("../config/db");
const Activity = require("../models/activity.model");
const User = require("../models/user.model");
const sendNotification = require("../utils/sendNotification");

const runCron = async () => {
  try {
    await connectDB();

    const now = new Date();

    console.log("🔥 CRON RUNNING...");

    const activities = await Activity.find({
      status: "active",
    }).populate("userId");

    console.log("Total active activities:", activities.length);

    for (let activity of activities) {
      const user = activity.userId;

      // ✅ expire activity
      if (now > activity.expiresAt) {
        if (activity.status !== "expired") {
          console.log("⏱ Expiring activity:", activity._id);
          activity.status = "expired";
        }
      }

      // skip invalid user/token/settings
      if (!user || !user.deviceToken || !user.notifications?.postMealWalkReminder) {
        await activity.save();
        continue;
      }

      const timePassed = now - activity.startedAt;

      const oneHour = 60 * 60 * 1000;
      const twoHours = 2 * 60 * 60 * 1000;

      // 🔔 1-hour notification
      if (timePassed >= oneHour && !activity.notifiedAt1Hour) {
        console.log("🔔 1 hour notification:", activity._id);

        await sendNotification(
          user.deviceToken,
          "Walk Reminder 🚶",
          "You haven't walked yet. Start now!"
        );

        activity.notifiedAt1Hour = true;
      }

      // 🔔 2-hour notification
      if (timePassed >= twoHours && !activity.notifiedAt2Hour) {
        console.log("🔔 2 hour notification:", activity._id);

        await sendNotification(
          user.deviceToken,
          "Activity Expired ⏱",
          "Your walking window has expired."
        );

        activity.notifiedAt2Hour = true;
      }

      await activity.save();
    }

  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
};

module.exports = runCron;