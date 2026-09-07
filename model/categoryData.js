import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  categoryType: {
    type: String,
    default: "General",
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

export default mongoose.model("Category", categorySchema);
