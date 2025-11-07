import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 8080;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const JWT_SECRET = process.env.JWT_SECRET || "";
export const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// Database configuration
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "mydb";
export const DB_PORT = process.env.DB_PORT || 3306;

// Email configuration
export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = process.env.SMTP_PORT || 587;
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";
export const SMTP_FROM = process.env.SMTP_FROM || "";
export const SMTP_TO = process.env.SMTP_TO || "";

// AWS SES configuration
export const AWS_SES_REGION = process.env.AWS_SES_REGION || "";
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
export const AWS_SES_FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || "";
export const AWS_SES_HR_EMAIL = process.env.AWS_SES_HR_EMAIL || "";

// MRR
export const MRR_API_URL = process.env.MRR_API_URL || "";
export const MRR_API_KEY = process.env.MRR_API_KEY || "";
export const MRR_API_SECRET = process.env.MRR_API_SECRET || "";
