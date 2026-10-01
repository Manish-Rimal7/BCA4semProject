import express from "express";
import {
    getAllDonations,
    getMyDonations,
} from "../controller/donationController.js";
import credential, { optionalCredential } from "../middleware/tokenChecker.js";

const router = express.Router();

// User-specific donation endpoints
router.get("/myDonations", credential, getMyDonations);
router.get("/mydonations", credential, getMyDonations);
router.get("/my", credential, getMyDonations);

// Community donations
router.get("/all", optionalCredential, getAllDonations);

// Base route handler
router.get("/", (req, res, next) => {
    if (
        req.query.my === "true" ||
        req.query.mine === "true" ||
        req.baseUrl.toLowerCase().includes("mydonations")
    ) {
        return credential(req, res, (err) => {
            if (err) return next(err);
            return getMyDonations(req, res, next);
        });
    }
    return optionalCredential(req, res, (err) => {
        if (err) return next(err);
        return getAllDonations(req, res, next);
    });
});

router.get("/api", (req, res, next) => {
    if (
        req.query.my === "true" ||
        req.query.mine === "true" ||
        req.baseUrl.toLowerCase().includes("mydonations")
    ) {
        return credential(req, res, (err) => {
            if (err) return next(err);
            return getMyDonations(req, res, next);
        });
    }
    return optionalCredential(req, res, (err) => {
        if (err) return next(err);
        return getAllDonations(req, res, next);
    });
});

export default router;
