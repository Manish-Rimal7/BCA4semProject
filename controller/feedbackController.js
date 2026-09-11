import Feedback from "../model/feedbackData.js";
import { responseManager } from "../middleware/responseManager.js";

export const submitFeedback = async (req, res) => {
  const { name, email, type, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return responseManager.error(res, 400, "Name, email, subject, and message are required");
  }

  try {
    const newFeedback = new Feedback({
      user: req.user ? req.user._id : null,
      name,
      email,
      type: type || "feedback",
      subject,
      message,
    });

    await newFeedback.save();

    console.log(`[FEEDBACK NOTIFICATION TO ] From: ${email} (${name}) | Type: ${type} | Subject: ${subject}`);

    return responseManager.success(
      res,
      201,
      "Thank you! Your feedback/report has been received and logged.",
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



