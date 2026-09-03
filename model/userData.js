import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  age: {
    type: Number,
    required: true,
  },

  mail: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    default: "user",
  },
});

export default mongoose.model("user", userSchema);
