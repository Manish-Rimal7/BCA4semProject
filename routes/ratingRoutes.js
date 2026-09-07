import express from "express";
import { addRating, getAllRatings } from "../controller/ratingsController.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();

router.post("/addRating/:UUID", credential, addRating);
router.get("/getAllRatings", getAllRatings);

export default router;
