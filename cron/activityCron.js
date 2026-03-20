const connectDB = require("../../config/db");
const Activity = require("../../models/activity.model");
const User = require("../../models/user.model");
const sendNotification = require("../../utils/sendNotification");

export default async function handler(req, res) {
  try {
    await connectDB();

    const now = new Date();

    console.log("🔥 VERCEL CRON RUNNING...");

    const activities = await Activity.find({
      status: "active"
    }).populate("userId");

    for (let activity of activities) {
      const user = activity.userId;

      // ✅ ALWAYS expire
      if (now > activity.expiresAt) {
        if (activity.status !== "expired") {
          console.log("⏱ Expiring:", activity._id);
          activity.status = "expired";
        }
      }

      // skip if no user
      if (!user) {
        await activity.save();
        continue;
      }

      // skip if no token
      if (!user.deviceToken) {
        await activity.save();
        continue;
      }

      // skip if notifications OFF
      if (!user.notifications?.postMealWalkReminder) {
        await activity.save();
        continue;
      }

      const timePassed = now - activity.startedAt;

      const oneHour = 60 * 60 * 1000;
      const twoHours = 2 * 60 * 60 * 1000;

      // 🔔 1 hour
      if (timePassed >= oneHour && !activity.notifiedAt1Hour) {
        await sendNotification(
          user.deviceToken,
          "Walk Reminder 🚶",
          "You haven't walked yet. Start now!"
        );
        activity.notifiedAt1Hour = true;
      }

      // 🔔 2 hour
      if (timePassed >= twoHours && !activity.notifiedAt2Hour) {
        await sendNotification(
          user.deviceToken,
          "Activity Expired ⏱",
          "Your walking window has expired."
        );
        activity.notifiedAt2Hour = true;
      }

      await activity.save();
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ Cron error:", error);
    res.status(500).json({ success: false });
  }
}