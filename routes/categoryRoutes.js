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

router.get("/getAllCategories", getAllCategories);
router.post("/addCategory", credential, addCategory);
router.post("/updateCategory/:id", credential, updateCategory);
router.put("/updateCategory/:id", credential, updateCategory);
router.post("/deleteCategory/:id", credential, deleteCategory);
router.delete("/deleteCategory/:id", credential, deleteCategory);
router.get("/getCategory/:categoryName", existingCategory);

export default router;
