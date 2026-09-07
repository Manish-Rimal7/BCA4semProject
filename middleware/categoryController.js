import categoryData from "../model/categoryData.js";
import { responseManager } from "./responseManager.js";

export const addCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return responseManager.error(res, 403, "You are not an admin");
    }

    const name = req.body.Categoryname || req.body.name;
    const { status } = req.body;

    if (!name) {
      return responseManager.error(
        res,
        400,
        "Category name is required"
      );
    }

    const existingcategory = await categoryData.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (existingcategory) {
      return responseManager.error(res, 409, "Category already exists");
    }

    const newCategory = await categoryData.create({
      name: name.trim(),
      categoryType: "General",
      status: status || "active",
    });

    return responseManager.success(res, 201, "Category created successfully", newCategory);
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { status: "active" };
    const categories = await categoryData.find(filter).sort({ name: 1 });
    return responseManager.success(res, 200, "Categories fetched successfully", categories);
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return responseManager.error(res, 403, "You are not an admin");
    }

    const { id } = req.params;
    const { name, categoryType, status } = req.body;

    const category = await categoryData.findById(id);
    if (!category) {
      return responseManager.error(res, 404, "Category not found");
    }

    if (name) category.name = name.trim();
    if (categoryType) category.categoryType = categoryType.trim();
    if (status) category.status = status;

    await category.save();

    return responseManager.success(res, 200, "Category updated successfully", category);
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return responseManager.error(res, 403, "You are not an admin");
    }

    const { id } = req.params;
    const category = await categoryData.findById(id);

    if (!category) {
      return responseManager.error(res, 404, "Category not found");
    }

    await category.deleteOne();

    return responseManager.success(res, 200, "Category deleted successfully");
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const existingCategory = async (req, res) => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return responseManager.error(res, 400, "Category name is required");
    }

    const existingcategory = await categoryData.findOne({
      name: categoryName,
    });

    if (!existingcategory) {
      return responseManager.error(res, 404, "Category does not exist");
    }

    return responseManager.success(
      res,
      200,
      "Category found",
      existingcategory
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};
