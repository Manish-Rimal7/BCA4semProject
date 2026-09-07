import mongoose from "mongoose";
import { env } from "../env.js";

export const db = async () => {
  try {
    await mongoose.connect(env.MONGO);
    console.log("Mongo connected");
  } catch (error) {
    console.log("error during mongo connection", error);
  }
};
