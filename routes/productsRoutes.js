import express from "express";
import { existingProducts } from "../middleware/existingProduct.js";
import {
  addProduct,
  getProduct,
  deleteProduct,
} from "../middleware/productController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();

router.post("/addProduct", credential, existingProducts, addProduct);
router.get("/getProducts/:UUID", getProduct);
router.post("/deleteProduct/:UUID", credential, deleteProduct);

export default router;
