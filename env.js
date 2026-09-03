import dotenv from "dotenv";
dotenv.config();

export const env = {
  JWTEXPIRY: process.env.JWTEXPIRY,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  MONGO: process.env.MONGO,
};
