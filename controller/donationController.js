import Product from "../model/productsData.js";
import Rating from "../model/ratings.js";
import User from "../model/userData.js";
import { responseManager } from "../middleware/responseManager.js";

// GET /api/donations - All community donation listings
export const getAllDonations = async (req, res) => {
  try {
    const filter = { isApproved: true };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const donations = await Product.find(filter)
      .populate("addedBy", "username")
      .sort({ createdAt: -1 })
      .lean();

    return responseManager.success(
      res,
      200,
      "Community donations retrieved successfully",
      {
        donations,
        totalCount: donations.length,
      }
    );
  } catch (error) {
    console.error("getAllDonations error:", error);
    return responseManager.error(res, 500, "Unable to load community donations");
  }
};

// GET /api/donations/myDonations - User's own donations
export const getMyDonations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return responseManager.error(res, 401, "User authentication required");
    }

    let products = [];
    try {
      products = await Product.find({ addedBy: userId })
        .populate("interestedUsers.user", "username mail")
        .populate("givenTo", "username")
        .sort({ createdAt: -1 })
        .lean();
    } catch (findErr) {
      console.warn("Product.find with populate failed, falling back to simple find:", findErr);
      products = await Product.find({ addedBy: userId }).sort({ createdAt: -1 }).lean();
    }

    let productRatings = [];
    try {
      const productIds = (products || []).map((p) => p._id).filter(Boolean);
      if (productIds.length > 0) {
        productRatings = await Rating.find({
          product: { $in: productIds },
        })
          .populate("user", "username")
          .lean();
      }
    } catch (ratingErr) {
      console.warn("Could not load ratings for donations:", ratingErr);
    }

    const productsWithRatings = (products || []).map((product) => {
      const pId = (product._id || product.id || "").toString();
      const matching = (productRatings || []).filter((r) => {
        if (!r || !r.product) return false;
        const rProdId = (r.product._id || r.product || "").toString();
        return rProdId && rProdId === pId;
      });
      const embedded = Array.isArray(product.ratings) ? product.ratings : [];
      const prodRatings = matching.length > 0 ? matching : embedded;

      return {
        ...product,
        ratings: prodRatings,
      };
    });

    return responseManager.success(
      res,
      200,
      "My donations loaded successfully",
      {
        products: productsWithRatings,
        donations: productsWithRatings,
        totalDonations: productsWithRatings.length,
      }
    );
  } catch (error) {
    console.error("getMyDonations error:", error);
    return responseManager.error(res, 500, error.message || "Unable to load my donations");
  }
};
