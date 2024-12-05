const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false cho cổng 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Bỏ qua xác thực TLS (không khuyến khích trong production)
  },
});

const sendVerificationEmail = async (email, token, username) => {
  const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"IUH CLUB" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verification</title>
        <style>
          body {
            font-family: sans-serif;
            background-color: #f0f0f0;
          }
  
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
  
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
  
          .header img {
            max-width: 200px;
          }
  
          .content {
            margin-bottom: 20px;
          }
  
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            text-decoration: none;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/03/logo-clb-ky-nang-iuh.png" alt="IUH CLUB Logo"> 
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h3>Hello ${username},</h3>
            <p>Please click the link below to verify your email address:</p>
            <a class="button" href="${verificationLink}">Verify Email</a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

module.exports = sendVerificationEmail;
