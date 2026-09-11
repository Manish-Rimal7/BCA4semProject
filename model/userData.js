import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    age: {
      type: Number,
      default: null,
    },

    mail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      alias: "email",
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
