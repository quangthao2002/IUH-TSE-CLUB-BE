const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    html: `<h3>Hello ${username},</h3>
           <p>Please click the link below to verify your email:</p>
           <a href="${verificationLink}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendVerificationEmail;
