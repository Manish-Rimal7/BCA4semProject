import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  product: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
    },
  ],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

export default mongoose.model("cart", cartSchema);
