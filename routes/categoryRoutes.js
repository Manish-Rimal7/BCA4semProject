import express from "express";
import {
  addCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  existingCategory,
} from "../middleware/categoryController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();

// List categories
router.get("/", getAllCategories);
router.get("/getAllCategories", getAllCategories);

// Category actions
router.post("/addCategory", credential, addCategory);
router.route("/updateCategory/:id").post(credential, updateCategory).put(credential, updateCategory);
router.route("/deleteCategory/:id").post(credential, deleteCategory).delete(credential, deleteCategory);
router.get("/getCategory/:categoryName", existingCategory);

export default router;
