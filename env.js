import dotenv from "dotenv";
dotenv.config();
process.env.TZ = process.env.TZ || "Asia/Kathmandu";


export const env = {
  JWTEXPIRY: process.env.JWTEXPIRY,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  MONGO: process.env.MONGO,
  FEEDBACK_RECEIVER_EMAIL: process.env.FEEDBACK_RECEIVER_EMAIL || "manishrimal100@gmail.com",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
};
