const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  startWalking,
  updateSteps,
  getCurrentActivity,
  getActivityStatus
} = require("../controllers/activity.controller");

router.post("/start", authMiddleware, startWalking);

router.post("/update", authMiddleware, updateSteps);

router.get("/current", authMiddleware, getCurrentActivity);

router.get("/status", authMiddleware, getActivityStatus);

module.exports = router;