const admin = require("../config/firebase");

const sendNotification = async (deviceToken, title, body) => {
  try {
    console.log("📤 Sending Notification...");
    console.log("Token:", deviceToken);
    console.log("Title:", title);
    console.log("Body:", body);

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