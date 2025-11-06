const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

// Tạo transporter sử dụng SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Route test gửi email
router.get("/", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Thông tin email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      subject: "Test Email từ API - Nodemailer SMTP",
      text: "Đây là email test được gửi tự động khi truy cập /api/email-smtp",
      html: `
        <h2>Test Email từ API</h2>
        <p>Đây là email test được gửi tự động khi truy cập <strong>/api/email-smtp</strong></p>
        <p>Thời gian gửi: ${new Date().toLocaleString("vi-VN")}</p>
        <hr>
        <p><em>Email được gửi bởi Nodemailer với SMTP</em></p>
      `,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Email đã được gửi thành công",
      messageId: info.messageId,
      sentEmail: {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
      },
      smtpInfo: {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT || 587,
        user: process.env.SMTP_USER,
      },
    });
  } catch (error) {
    // Xử lý các lỗi cụ thể của SMTP
    if (error.code === "EAUTH") {
      return res.status(401).json({
        success: false,
        message: "Lỗi xác thực SMTP. Vui lòng kiểm tra username và password.",
        error: error.message,
      });
    }

    if (error.code === "ECONNECTION") {
      return res.status(500).json({
        success: false,
        message:
          "Không thể kết nối đến SMTP server. Vui lòng kiểm tra host và port.",
        error: error.message,
      });
    }

    if (error.code === "ETIMEDOUT") {
      return res.status(500).json({
        success: false,
        message: "Kết nối SMTP bị timeout.",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi gửi email",
      error: error.message,
    });
  }
});

module.exports = router;
