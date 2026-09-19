import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "products",
    default: null,
  },

  experienceType: {
    type: String,
    enum: ["donation", "product", "receiver", "general", "suggestion"],
    default: "donation",
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  productRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },

  donorRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },

  comment: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Rating", ratingSchema);
