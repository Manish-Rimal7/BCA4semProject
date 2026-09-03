import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  activity: {
    type: String,
    required: true,
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    default: null,
  },

  details: {
    type: String,
    default: "",
  },
});

export default mongoose.model("Activity", activitySchema);
