const nodemailer = require("nodemailer");

const sendVerificationEmail = async (userEmail, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Hoặc dịch vụ email khác
    auth: {
      user: process.env.EMAIL_USER, // Email của bạn
      pass: process.env.EMAIL_PASSWORD, // Mật khẩu email
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Email Verification",
    text: `Please verify your email by clicking on the following link: http://localhost:5000/api/auth/verify-email?token=${token}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
