const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const { setupProfile, getProfile, updateProfile } = require("../controllers/profile.controller");

router.post("/setup", authMiddleware, setupProfile);

router.get("/me", authMiddleware, getProfile);

router.patch("/update", authMiddleware, updateProfile);

module.exports = router;