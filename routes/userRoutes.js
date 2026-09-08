import express from "express";
import {
  userRegistration,
  userLogin,
  updateProfile,
  getMe,
  toggleAdminRole,
} from "../controller/userAuth.js";
import validator from "../middleware/validator.js";
import { registerSchema } from "../model/authvalidator.js";
import credential from "../middleware/tokenChecker.js";

const router = express.Router();
router.post("/userRegister", validator(registerSchema), userRegistration);
router.post("/userLogin", userLogin);
router.post("/updateProfile", credential, updateProfile);
router.get("/getMe", credential, getMe);
router.post("/toggleAdminRole", credential, toggleAdminRole);

export default router;