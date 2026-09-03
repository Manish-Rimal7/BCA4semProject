import express from "express";
import { userRegistration, userLogin } from "../controller/userAuth.js";
import validator from "../middleware/validator.js";
import { registerSchema } from "../model/authvalidator.js";

const router = express.Router();
router.post("/userRegister", validator(registerSchema), userRegistration);
router.post("/userLogin", userLogin);

export default router;
//bolt lovable replit.com