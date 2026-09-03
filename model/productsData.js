import mongoose, { mongo } from "mongoose";

const productSchema = mongoose.Schema({
  UUID: {
    type: String,
    required: true,
    unique: true,
  },

  productName: {
    type: String,
    required: true,
  },

  productCategory: {
    type: String,
    required: true,
  },

  productUseful: {
    type: String,
    required: true,
  },

  productModel: {
    type: String,
    required: true,
  },

  productFeatures: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "booked", "sold"],
    default: "available",
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
  },

  averageRating: {
    type: Number,
    default: 0,
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export default mongoose.model("products", productSchema);
