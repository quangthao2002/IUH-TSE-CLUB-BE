const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // dùng `true` nếu bạn sử dụng cổng 465, với Gmail là `false` cho TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true, // thêm để thấy thông báo log
  debug: true, // thêm để hiển thị thông báo debug
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://your-website.com/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    text: `Click this link to verify your email: ${verificationLink}`,
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendVerificationEmail;
