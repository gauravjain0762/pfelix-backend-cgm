const nodemailer = require("nodemailer");
const dns = require("dns");

// force Node to use IPv4 instead of IPv6
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,   // force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
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

  } catch (error) {

    console.error("❌ Email error:", error.message);

  }
};

module.exports = sendEmail;