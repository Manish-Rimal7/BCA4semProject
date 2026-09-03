import mongoose from "mongoose";

export const db = async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Mongo connected");
  } catch (error) {
    console.log("error during mongo connection", error);
  }
};
