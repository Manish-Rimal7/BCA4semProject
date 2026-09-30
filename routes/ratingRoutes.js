import express from "express";
import { addRating, getAllRatings } from "../controller/ratingsController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();

// Get ratings
router.get("/", getAllRatings);
router.get("/getAllRatings", getAllRatings);

// Add rating
router.post("/addRating/:UUID", credential, addRating);
router.post("/addRating", credential, addRating);
router.post("/:UUID", credential, addRating);
router.post("/", credential, addRating);

export default router;
