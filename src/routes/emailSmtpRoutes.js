import { Router } from "express";
import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  SMTP_TO,
} from "../configs/env.js";

const router = Router();

// Tạo transporter sử dụng SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

// Route test gửi email
router.get("/", async (req, res) => {
  try {
    const transporter = createTransporter();

    // Thông tin email
    const mailOptions = {
      from: SMTP_FROM,
      to: SMTP_TO,
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
        host: SMTP_HOST,
        port: SMTP_PORT,
        user: SMTP_USER,
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

export default router;
