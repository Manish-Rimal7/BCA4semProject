import Product from "../model/productsData.js";
import Rating from "../model/ratings.js";
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

    const products = await Product.find({ addedBy: userId })
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username")
      .populate("ratings.user", "username")
      .sort({ createdAt: -1 })
      .lean();

    const productIds = products.map((product) => product._id);

    const productRatings =
      productIds.length > 0
        ? await Rating.find({
            product: { $in: productIds },
            user: { $ne: userId },
          })
            .populate("user", "username")
            .lean()
        : [];

    const productsWithRatings = products.map((product) => {
      const matching = productRatings.filter(
        (r) =>
          r.product &&
          (r.product._id || r.product).toString() === product._id.toString()
      );
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
        totalDonations: products.length,
      }
    );
  } catch (error) {
    console.error("getMyDonations error:", error);
    return responseManager.error(res, 500, "Unable to load my donations");
  }
};
