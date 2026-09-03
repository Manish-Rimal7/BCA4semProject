import cartData from "../model/cartData.js";
import { responseManager } from "./responseManager.js";
import { makeActivity } from "../services/activityService.js";

export const addTOCart = async (req, res) => {
  try {
    const { _id, quantity = 1 } = req.body;
    const userId = req.user._id;

    if (!_id) {
      return responseManager.error(res, 400, "Product ID is required");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return responseManager.error(
        res,
        400,
        "Quantity must be a positive integer"
      );
    }

    let cart = await cartData.findOne({
      user: userId,
    });

    if (!cart) {
      cart = new cartData({
        user: userId,
        product: [
          {
            product: _id,
            quantity: quantity,
          },
        ],
      });

      await cart.save();
    } else {
      const existingProduct = cart.product.find(
        (item) => item.product.toString() === _id.toString()
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.product.push({
          product: _id,
          quantity: quantity,
        });
      }

      await cart.save();
    }

    const updatedCart = await cartData
      .findOne({ user: userId })
      .populate("product.product");

    const addedProduct = updatedCart.product.find(
      (item) => item.product && item.product._id.toString() === _id.toString()
    );

    const productName = addedProduct?.product?.productName || "product";

    await makeActivity(
      userId,
      "CART_ADDED",
      _id,
      `"${productName}" added to cart`
    );

    return responseManager.success(
      res,
      201,
      "Product added to cart",
      updatedCart
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Error adding product to cart");
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { _id } = req.body;
    const userId = req.user._id;

    if (!_id) {
      return responseManager.error(res, 400, "Product ID is required");
    }

    // Populate before removing the product so we can
    // get its name for the activity.
    const cart = await cartData
      .findOne({ user: userId })
      .populate("product.product");

    if (!cart) {
      return responseManager.error(res, 404, "Cart not found");
    }

    const productIndex = cart.product.findIndex(
      (item) => item.product && item.product._id.toString() === _id.toString()
    );

    if (productIndex === -1) {
      return responseManager.error(res, 404, "Product not found in cart");
    }

    const removedProduct = cart.product[productIndex].product;
    const removedProductName = removedProduct.productName || "product";

    cart.product.splice(productIndex, 1);

    await cart.save();

    const updatedCart = await cartData
      .findOne({ user: userId })
      .populate("product.product");

    await makeActivity(
      userId,
      "CART_REMOVED",
      removedProduct._id,
      `"${removedProductName}" removed from cart`
    );

    return responseManager.success(
      res,
      200,
      "Product removed from cart",
      updatedCart
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Error removing product from cart");
  }
};
