import express from "express";
import { addRating } from "../controller/ratingsController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();

router.post("/addRating/:UUID", credential, addRating);

export default router;
