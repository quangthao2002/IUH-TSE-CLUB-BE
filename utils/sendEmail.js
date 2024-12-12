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
  const verificationLink = `${process.env.DOMAIN_ENDPOINT}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"IUH TSE Club" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Xác thực tài khoản - IUH TSE Club",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Xác thực tài khoản - IUH TSE Club</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
          }
          .email-header {
            text-align: center;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .email-header img {
            max-width: 150px;
          }
          .email-body {
            color: #333;
          }
          .email-body h1 {
            font-size: 20px;
            color: #333;
          }
          .email-body p {
            line-height: 1.6;
          }
          .verify-button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background-color: #4CAF50;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/03/logo-clb-ky-nang-iuh.png" alt="IUH TSE Club Logo">
            <h2>IUH TSE Club</h2>
          </div>
          <div class="email-body">
            <h1>Xin chào ${username},</h1>
            <p>Chúng tôi rất vui mừng khi bạn đã đăng ký tham gia Câu lạc bộ Tài năng Lập trình - IUH TSE Club!</p>
            <p>Để hoàn tất đăng ký, vui lòng nhấn vào nút dưới đây để xác thực tài khoản của bạn:</p>
            <p style="text-align: center;">
              <a class="verify-button" style="color:white;background-color:#15c" href="${verificationLink}" target="_blank">Xác Thực Tài Khoản</a>
            </p>
            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
            <p>Cảm ơn bạn đã tham gia cùng chúng tôi!</p>
            <p>Trân trọng,<br>Đội ngũ IUH TSE Club</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 IUH TSE Club. Mọi quyền được bảo lưu.</p>
            <p>Email này được gửi từ hệ thống tự động. Vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

const sendNotificationEmail = async (email, subject, content) => {
  try {
    // Cấu hình nội dung email
    const mailOptions = {
      from: process.env.EMAIL_USER, // Địa chỉ email gửi
      to: email, // Email người nhận
      subject, // Chủ đề email
      html: content, // Nội dung email (HTML format)
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

module.exports = { sendVerificationEmail, sendNotificationEmail };
