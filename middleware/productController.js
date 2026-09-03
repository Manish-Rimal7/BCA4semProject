import Product from "../model/productsData.js";
import { responseManager } from "./responseManager.js";
import Rating from "../model/ratings.js";
import crypto from "crypto";
import { makeActivity } from "../services/activityService.js";

export const addProduct = async (req, res) => {
  const {
    productName,
    productCategory,
    productUseful,
    productModel,
    productFeatures,
  } = req.body;

  if (
    !productName ||
    !productCategory ||
    !productUseful ||
    !productModel ||
    !productFeatures
  ) {
    return responseManager.error(res, 400, "All fields are required");
  }

  try {
    const newProduct = new Product({
      UUID: crypto.randomUUID(),
      productName,
      productCategory,
      productUseful,
      productModel,
      productFeatures,
      addedBy: req.user._id,
    });

    await newProduct.save();

    await makeActivity(
      req.user._id,
      "PRODUCT_ADDED",
      newProduct._id,
      `Product "${productName}" added to the list`
    );

    return responseManager.success(
      res,
      201,
      "Product added to the list",
      newProduct
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, `Error ${error}`);
  }
};

export const getProduct = async (req, res) => {
  const { UUID } = req.params;

  if (!UUID) {
    return responseManager.error(res, 400, "Product UUID is required");
  }

  try {
    const product = await Product.findOne({ UUID }).populate(
      "addedBy",
      "username mail"
    );

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    const ratings = await Rating.find({
      product: product._id,
    }).populate("user", "username");

    return responseManager.success(res, 200, {
      product,
      ratings,
    });
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const deleteProduct = async (req, res) => {
  const { UUID } = req.params;

  if (!UUID) {
    return responseManager.error(res, 400, "Product UUID is required");
  }

  try {
    const product = await Product.findOne({ UUID });

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    if (product.addedBy.toString() !== req.user._id.toString()) {
      return responseManager.error(
        res,
        403,
        "You are not allowed to delete this product"
      );
    }

    const productId = product._id;
    const productName = product.productName;

    await product.deleteOne();

    await makeActivity(
      req.user._id,
      "product deleted",
      productId,
      `Product "${productName}" deleted from the list`
    );

    return responseManager.success(res, 200, "Product deleted successfully");
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};
