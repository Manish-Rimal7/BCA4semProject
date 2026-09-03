import express from "express";
import { Dashboard } from "../controller/userDashboardController.js";
import { AdminDashboard } from "../controller/adminDashboardController.js";
import credential from "../middleware/tokenChecker.js";
import adminChecker from "../middleware/adminChecker.js";

const router = express.Router();

router.get("/dashboard", credential, Dashboard);

router.get("/admin", credential, adminChecker, AdminDashboard);

export default router;
