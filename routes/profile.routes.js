const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const { setupProfile, getProfile } = require("../controllers/profile.controller");

router.post("/setup", authMiddleware, setupProfile);

router.get("/me", authMiddleware, getProfile);

module.exports = router;