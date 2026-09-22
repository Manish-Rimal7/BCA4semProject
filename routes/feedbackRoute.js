import express from "express";
import { submitFeedback, getAllFeedbacks } from "../controller/feedbackController.js";
import credential, { optionalCredential } from "../middleware/tokenChecker.js";
import adminChecker from "../middleware/adminChecker.js";

const router = express.Router();

router.post("/submit", optionalCredential, submitFeedback);
router.get("/getAllFeedbacks", credential, adminChecker, getAllFeedbacks);

export default router;
