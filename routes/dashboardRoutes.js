import express from "express";
import { Dashboard } from "../controller/userDashboardController.js";
import { AdminDashboard } from "../controller/adminDashboardController.js";
import credential from "../middleware/tokenChecker.js";
import adminChecker from "../middleware/adminChecker.js";

const router = express.Router();

// GET /api/dashboard & GET /api/dashboard/dashboard
router.get("/", credential, Dashboard);
router.get("/dashboard", credential, Dashboard);

// GET /api/dashboard/admin
router.get("/admin", credential, adminChecker, AdminDashboard);

export default router;
