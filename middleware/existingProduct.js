import Product from "../model/productsData.js";
import { responseManager } from "./responseManager.js";

export const existingProducts = async (req, res, next) => {
  try {
    const { productName, productCategory, productModel } = req.body;

    if (!productName || !productCategory || !productModel) {
      return responseManager.error(
        res,
        400,
        "Product name, category and model are required"
      );
    }

    const existingProduct = await Product.findOne({
      productName,
      productCategory,
      productModel,
    });

    if (existingProduct) {
      return responseManager.error(res, 409, "Product already exists");
    }

    next();
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

