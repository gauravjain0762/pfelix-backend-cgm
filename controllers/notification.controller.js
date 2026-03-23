const Notification = require("../models/notification.model");

// ✅ Get all notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// ✅ Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
};