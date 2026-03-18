const express = require("express");

const router = express.Router();

const {
  register,
  login, 
  forgotPassword,
  verifyOtp,
  resetPassword,
  deleteAccount
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOtp);

router.post("/reset-password", resetPassword);

// DELETE ACCOUNT
router.delete("/delete-account", authMiddleware, deleteAccount);

module.exports = router;