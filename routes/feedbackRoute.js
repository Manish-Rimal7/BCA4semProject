import express from "express";
import { submitFeedback, getAllFeedbacks } from "../controller/feedbackController.js";
import { optionalCredential } from "../middleware/tokenChecker.js";

const router = express.Router();

router.post("/submit", optionalCredential, submitFeedback);
router.get("/getAllFeedbacks", getAllFeedbacks);

export default router;
