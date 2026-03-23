const admin = require("../config/firebase");
const Notification = require("../models/notification.model");

const sendNotification = async (deviceToken, title, body, userId) => {
  try {
    console.log("📤 Sending Notification...");
    console.log("Token:", deviceToken);
    console.log("Title:", title);
    console.log("Body:", body);

    // ✅ 1. Save notification in DB
    if (userId) {
      await Notification.create({
        userId,
        title,
        body,
      });
    }

    // ✅ 2. Send push notification
    await admin.messaging().send({
      token: deviceToken,
      notification: {
        title,
        body,
      },
    });

    console.log("✅ Notification sent");

  } catch (error) {
    console.error("❌ Notification error:", error.message);
  }
};

module.exports = sendNotification;