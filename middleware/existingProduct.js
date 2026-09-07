import Product from "../model/productsData.js";
import { responseManager } from "./responseManager.js";

export const existingProducts = async (req, res, next) => {
  try {
    const { productName, productCategory, condition, productModel } = req.body;
    const finalCondition = condition || productModel;

    if (!productName || !productCategory || !finalCondition) {
      return responseManager.error(
        res,
        400,
        "Product name, category and condition are required"
      );
    }

    const existingProduct = await Product.findOne({
      productName,
      productCategory,
      condition: finalCondition,
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

