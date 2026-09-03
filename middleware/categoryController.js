import categoryData from "../model/categoryData.js";
import { responseManager } from "./responseManager.js";

export const addCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return responseManager.error(res, 409, "You are not an admin");
    }

    const { Categoryname, categoryType } = req.body;

    if (!Categoryname || !categoryType) {
      return responseManager.error(
        res,
        409,
        "Category name and category type are required"
      );
    }

    const existingcategory = await categoryData.findOne({
      name: Categoryname,
    });

    if (existingcategory) {
      return responseManager.error(res, 409, "Category already exists");
    }

    const newCategory = await categoryData.create({
      name: Categoryname,
      categoryType: categoryType,
    });

    return responseManager.success(res, 201, "category created");
  } catch (error) {
    console.log(error);

    return responseManager.error(res, 500, "Server error");
  }
};

export const existingCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return responseManager.error(res, 409, "Category name is required");
    }

    const existingcategory = await categoryData.findOne({
      name: categoryName,
    });

    if (!existingcategory) {
      return responseManager.error(res, 409, "Category does not exist");
    }

    return responseManager.success(res, 201, "Category found");
  } catch (error) {
    console.log(error);

    return responseManager.error(res, 500, "Server error");
  }
};
