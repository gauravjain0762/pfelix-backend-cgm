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
   
   res.json({
  success: true,
  message: "User registered successfully"
});

// SEND WELCOME EMAIL

await sendEmail(
  email,
  "Welcome to Pfelix CGM 🎉",
  `Hello ${name},

Your account has been successfully created on Pfelix CGM.

You can now start scanning meals and tracking glucose predictions.

Thank you for joining Pfelix!

- Pfelix Team`
);



  } catch (error) {

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

     res.json({
      success: true,
      message: "OTP sent to email"
    });

      sendEmail(
      user.email,
      "Password Reset OTP",
      `Your OTP is: ${otp}`
    ).catch(console.error);


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

module.exports = { register, login, forgotPassword, verifyOtp, resetPassword };