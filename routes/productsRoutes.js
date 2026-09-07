import express from "express";
import { existingProducts } from "../middleware/existingProduct.js";
import {
  addProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  approveProduct,
  rejectProduct,
  toggleInterest,
  giveProduct,
  getMyRequests,
} from "../middleware/productController.js";
import credential from "../middleware/tokenChecker.js";
import adminChecker from "../middleware/adminChecker.js";

const router = express.Router();

router.post("/addProduct", credential, existingProducts, addProduct);
router.get("/getProducts", getAllProducts);
router.get("/myRequests", credential, getMyRequests);
router.get("/getProducts/:UUID", getProduct);
router.post("/deleteProduct/:UUID", credential, deleteProduct);
router.post("/approveProduct/:UUID", credential, adminChecker, approveProduct);
router.post("/rejectProduct/:UUID", credential, adminChecker, rejectProduct);
router.post("/toggleInterest/:UUID", credential, toggleInterest);
router.post("/giveProduct/:UUID", credential, giveProduct);

export default router;
