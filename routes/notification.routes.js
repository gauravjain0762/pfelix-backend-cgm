const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
} = require("../controllers/notification.controller");

// 🔐 if you have auth middleware, use it here
const authMiddleware = require("../middleware/auth.middleware");

// ✅ Get notifications
router.get("/", authMiddleware, getNotifications);

// ✅ Mark as read
router.put("/:id/read", authMiddleware, markAsRead);

module.exports = router;