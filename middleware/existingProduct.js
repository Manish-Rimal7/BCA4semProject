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

    const trimmedName = typeof productName === "string" ? productName.trim() : productName;
    const existingProduct = await Product.findOne({
      productName: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      productCategory: typeof productCategory === "string" ? productCategory.trim() : productCategory,
      condition: typeof finalCondition === "string" ? finalCondition.trim() : finalCondition,
      addedBy: req.user._id,
      status: { $ne: "given" },
    });

    if (existingProduct) {
      return responseManager.error(res, 409, "You have already listed this product");
    }

    next();
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

