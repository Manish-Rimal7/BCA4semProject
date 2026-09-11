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

  location: {
    type: String,
  },

  condition: {
    type: String,
  },

  description: {
    type: String,
  },
  productImage: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["available", "booked", "given", "sold"],
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

  givenTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null,
  },

  interestedUsers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      purpose: {
        type: String,
        default: "",
      },
      interestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
}, { timestamps: true });

export default mongoose.model("products", productSchema);
