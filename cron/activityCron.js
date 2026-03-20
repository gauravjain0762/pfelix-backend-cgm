import connectDB from "../../config/db.js";
import Activity from "../../models/activity.model.js";
import User from "../../models/user.model.js";
import sendNotification from "../../utils/sendNotification.js";

export default async function handler(req, res) {
  // ✅ Allow only GET (Vercel cron uses GET)
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectDB();

    const now = new Date();

    console.log("🔥 VERCEL CRON RUNNING...");

    const activities = await Activity.find({
      status: "active"
    }).populate("userId");

    console.log("Total active activities:", activities.length);

    for (let activity of activities) {
      const user = activity.userId;

      // ✅ STEP 1: ALWAYS EXPIRE (independent of notifications)
      if (now > activity.expiresAt) {
        if (activity.status !== "expired") {
          console.log("⏱ Expiring activity:", activity._id);
          activity.status = "expired";
        }
      }

      // ✅ STEP 2: Notification logic

      // skip if no user
      if (!user) {
        await activity.save();
        continue;
      }

      // skip if no device token
      if (!user.deviceToken) {
        console.log("⚠️ No device token for user:", user._id);
        await activity.save();
        continue;
      }

      // skip if notifications OFF
      if (!user.notifications?.postMealWalkReminder) {
        console.log("🔕 Notifications OFF for user:", user._id);
        await activity.save();
        continue;
      }

      const timePassed = now - activity.startedAt;

      const oneHour = 60 * 60 * 1000;
      const twoHours = 2 * 60 * 60 * 1000;

      // 🔔 1-hour notification
      if (timePassed >= oneHour && !activity.notifiedAt1Hour) {
        console.log("🔔 1 hour notification triggered:", activity._id);

        await sendNotification(
          user.deviceToken,
          "Walk Reminder 🚶",
          "You haven't walked yet. Start now!"
        );

        activity.notifiedAt1Hour = true;
      }

      // 🔔 2-hour notification
      if (timePassed >= twoHours && !activity.notifiedAt2Hour) {
        console.log("🔔 2 hour notification triggered:", activity._id);

        await sendNotification(
          user.deviceToken,
          "Activity Expired ⏱",
          "Your walking window has expired."
        );

        activity.notifiedAt2Hour = true;
      }

      await activity.save();
    }

    return res.status(200).json({
      success: true,
      message: "Cron executed successfully"
    });

  } catch (error) {
    console.error("❌ Cron Error:", error);

    return res.status(500).json({
      success: false,
      message: "Cron failed"
    });
  }
}