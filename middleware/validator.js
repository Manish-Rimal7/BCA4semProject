import { responseManager } from "./responseManager.js";
import user from "../model/userData.js";

const validator = (schema) => {
  return async (req, res, next) => {
    // Normalize email and mail keys
    if (!req.body.mail && req.body.email) {
      req.body.mail = req.body.email;
    } else if (!req.body.email && req.body.mail) {
      req.body.email = req.body.mail;
    }

    const rawMail = req.body.mail || req.body.email;
    if (!rawMail || typeof rawMail !== "string" || !rawMail.trim()) {
      return responseManager.error(res, 400, "Email is required");
    }

    const cleanMail = rawMail.trim().toLowerCase();

    // The only validation requirement: same email cannot be used for more than one account
    try {
      const existingUser = await user.findOne({
        $or: [
          { mail: { $regex: new RegExp(`^${cleanMail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
          { email: { $regex: new RegExp(`^${cleanMail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
        ],
      });

      if (existingUser) {
        return responseManager.error(
          res,
          409,
          "This email is already registered. The same email cannot be used for another account."
        );
      }
    } catch (err) {
      console.error("Email uniqueness validation error:", err);
    }

    // Run schema if provided, but allow any extra properties
    if (schema && typeof schema.validate === "function") {
      const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
      if (error) {
        return res.status(400).json({
          msg: "validation error",
          details: error.details?.map((d) => d.message),
        });
      }
      if (value) {
        req.body = { ...req.body, ...value };
      }
    }

    next();
  };
};

export default validator;
