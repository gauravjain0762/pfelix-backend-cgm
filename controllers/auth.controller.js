const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");


// REGISTER

const register = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // GENERATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // SEND WELCOME EMAIL
    await sendEmail(
      email,
      "Welcome to Pfelix CGM 🎉",
      `Hello ${name},

Your account has been successfully created on Pfelix CGM.

You can now start scanning meals and tracking glucose predictions.

- Pfelix Team`
    );

    // RESPONSE
    res.json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};



// LOGIN

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

//Forgot password

const forgotPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

user.resetOtp = otp;
user.otpExpiry = Date.now() + 10 * 60 * 1000;

await user.save();

await sendEmail(
  user.email,
  "Password Reset OTP",
  `Your OTP is: ${otp}`
);

res.json({
  success: true,
  message: "OTP sent to email"
});


  } catch (error) {

  console.error("Forgot password error:", error);

  res.status(500).json({
    success: false,
    message: error.message
  });

}
};

const verifyOtp = async (req, res) => {

  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.resetOtp !== otp) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP"
    });
  }

  if (user.otpExpiry < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "OTP expired"
    });
  }

  res.json({
    success: true,
    message: "OTP verified"
  });

};

const resetPassword = async (req, res) => {

  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.resetOtp = null;
  user.otpExpiry = null;

  await user.save();

  res.json({
    success: true,
    message: "Password reset successful"
  });

};

const deleteAccount = async (req, res) => {
  try {

    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const email = user.email;
    const name = user.name;

    // delete user
    await User.findByIdAndDelete(userId);

    // send deletion email
    await sendEmail(
      email,
      "Account Deleted - Pfelix CGM",
      `Hello ${name},

Your Pfelix CGM account has been successfully deleted.

If this was not requested by you or you want to recover your account,
please contact our support team.

Support Email: support@pfelix.com

Thank you,
Pfelix Team`
    );

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};


const saveDeviceToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceToken } = req.body;

    await User.findByIdAndUpdate(userId, {
      deviceToken
    });

    res.json({
      success: true,
      message: "Device token saved"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = { register, login, forgotPassword, verifyOtp, resetPassword, deleteAccount, saveDeviceToken };