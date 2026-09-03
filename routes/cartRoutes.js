import express from "express";
import { addTOCart, removeFromCart } from "../middleware/cartController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();
router.post("/addToCart", credential, addTOCart);
router.post("/removeFromCart", credential, removeFromCart);

export default router;
