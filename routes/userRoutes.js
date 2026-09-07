import express from "express";
import { userRegistration, userLogin, updateProfile } from "../controller/userAuth.js";
import validator from "../middleware/validator.js";
import { registerSchema } from "../model/authvalidator.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();
router.post("/userRegister", validator(registerSchema), userRegistration);
router.post("/userLogin", userLogin);
router.post("/updateProfile", credential, updateProfile);

export default router;
//bolt lovable replit.com