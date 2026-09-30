import express from "express";
import { submitFeedback, getAllFeedbacks } from "../controller/feedbackController.js";
import credential, { optionalCredential } from "../middleware/tokenChecker.js";
import adminChecker from "../middleware/adminChecker.js";

const router = express.Router();

// Feedback submission
router.post("/", optionalCredential, submitFeedback);
router.post("/submit", optionalCredential, submitFeedback);

// Feedback retrieval (admin only)
router.get("/", credential, adminChecker, getAllFeedbacks);
router.get("/getAllFeedbacks", credential, adminChecker, getAllFeedbacks);

export default router;
