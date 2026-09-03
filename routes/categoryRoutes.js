import express from "express";
// import {
//   addCategory,
//   existingCategory,
// } from "../middleware/categoryController.js";
import {
  addCategory,
  existingCategory,
} from "../middleware/categoryController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();

router.post("/addCategory", credential, addCategory);

router.get("/getCategory/:categoryName", existingCategory);

export default router;
