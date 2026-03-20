const cron = require("node-cron");
const Activity = require("../models/activity.model");
const User = require("../models/user.model");
const sendNotification = require("../utils/sendNotification");

const checkActivities = async () => {
  const now = new Date();

  const activities = await Activity.find({
    status: "active"
  }).populate("userId");

  console.log("Checking activities...");

  for (let activity of activities) {

    const user = activity.userId;

    // skip if no token
    if (!user?.deviceToken) continue;

    // skip if notifications OFF
    if (!user?.notifications?.postMealWalkReminder) continue;

    const timePassed = now - activity.startedAt;

    const oneHour = 60 * 60 * 1000;
    const twoHours = 2 * 60 * 60 * 1000;

    //  1 hour notification
    if (timePassed >= oneHour && !activity.notifiedAt1Hour) {
        console.log("1 hour notification triggered");
      await sendNotification(
        user.deviceToken,
        "Walk Reminder 🚶",
        "You haven't walked yet. Start now!"
      );

      activity.notifiedAt1Hour = true;
    }
    

    //  2 hour notification + expire
    if (timePassed >= twoHours && !activity.notifiedAt2Hour) {
         console.log("2 hour notification triggered");
      await sendNotification(
        user.deviceToken,
        "Activity Expired ⏱",
        "Your walking window has expired."
      );

      activity.notifiedAt2Hour = true;
      activity.status = "expired";
    }

    await activity.save();
  }
};

// run every 5 minutes
cron.schedule("*/5 * * * *", checkActivities);

module.exports = {};