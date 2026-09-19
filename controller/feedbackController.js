import Feedback from "../model/feedbackData.js";
import { responseManager } from "../middleware/responseManager.js";
import { sendFeedbackEmail } from "../services/emailService.js";

export const submitFeedback = async (req, res) => {
  const { name, email, type, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return responseManager.error(res, 400, "Name, email, subject, and message are required");
  }

  try {
    const validTypes = ["report", "bug", "bug_report", "suggestion", "feedback", "inappropriate", "complaint", "other"];
    const feedbackType = validTypes.includes(type?.toLowerCase()) ? type.toLowerCase() : "feedback";
    const newFeedback = new Feedback({
      user: req.user ? req.user._id : null,
      name,
      email,
      type: feedbackType,
      subject,
      message,
    });

    await newFeedback.save();

    // Send email notification to configured receiver
    await sendFeedbackEmail({
      name,
      email,
      type: feedbackType,
      subject,
      message,
    });

    return responseManager.success(
      res,
      201,
      "Thank you! Your feedback/report has been received.",
      newFeedback
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return responseManager.error(res, 500, "Failed to submit feedback");
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "username mail")
      .sort({ createdAt: -1 });

    return responseManager.success(
      res,
      200,
      "Feedbacks fetched successfully",
      feedbacks
    );
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return responseManager.error(res, 500, "Server error");
  }
};



