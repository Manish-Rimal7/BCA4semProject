import express from "express";
import { submitFeedback, getAllFeedbacks } from "../controller/feedbackController.js";

const router = express.Router();

router.post("/submit", submitFeedback);
router.get("/getAllFeedbacks", getAllFeedbacks);

export default router;
