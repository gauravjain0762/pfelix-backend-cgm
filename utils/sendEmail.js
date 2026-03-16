const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,              // keeps connection open
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
});

const sendEmail = async (to, subject, text) => {
  try {

    const info = await transporter.sendMail({
      from: `"Pfelix CGM" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("✅ Email sent:", info.response);

    return true;

  } catch (error) {

    console.error("❌ Email error:", error.message);

    return false;

  }
};

module.exports = sendEmail;