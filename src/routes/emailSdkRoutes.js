import { Router } from "express";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  AWS_SES_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_SES_FROM_EMAIL,
  AWS_SES_HR_EMAIL,
} from "../configs/env.js";

const router = Router();

// Config AWS SES
const config = {
  region: AWS_SES_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};
// Khởi tạo AWS SES client
const sesClient = new SESClient(config);

router.get("/", async (req, res) => {
  try {
    const input = {
      from: AWS_SES_FROM_EMAIL,
      to: AWS_SES_HR_EMAIL,
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

export default router;
