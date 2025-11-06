const express = require("express");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const router = express.Router();

// Khởi tạo AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

router.get("/", async (req, res) => {
  try {
    const input = {
      from: process.env.AWS_SES_FROM_EMAIL || "hr@digitalfortress.dev",
      to: process.env.AWS_SES_HR_EMAIL || "hai.tran@digitalfortress.dev",
      subject: "Test Email từ API",
      message: "Đây là email test được gửi tự động khi truy cập /api/email",
    };

    // Tạo command để gửi email
    const command = new SendEmailCommand({
      Source: input.from,
      Destination: {
        ToAddresses: [input.to],
      },
      Message: {
        Subject: {
          Data: input.subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: input.message,
            Charset: "UTF-8",
          },
        },
      },
    });

    // Gửi email
    const result = await sesClient.send(command);

    res.json({
      success: true,
      message: "Email đã được gửi thành công",
      messageId: result.MessageId,
      sentEmail: input,
    });
  } catch (error) {
    // Xử lý lỗi cụ thể của AWS SES
    if (error.name === "MessageRejected") {
      return res.status(400).json({
        success: false,
        message:
          "Email bị từ chối. Vui lòng kiểm tra địa chỉ email và nội dung.",
        error: error.message,
      });
    }

    if (error.name === "ConfigurationSetDoesNotExist") {
      return res.status(500).json({
        success: false,
        message: "Lỗi cấu hình AWS SES",
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
