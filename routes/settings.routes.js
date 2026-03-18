const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const { updateNotifications } = require("../controllers/settings.controller");

router.patch("/notifications", authMiddleware, updateNotifications);

module.exports = router;