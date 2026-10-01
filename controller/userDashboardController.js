import User from "../model/userData.js";
import Product from "../model/productsData.js";
import Rating from "../model/ratings.js";
import Activity from "../model/activityData.js";
import { responseManager } from "../middleware/responseManager.js";

// Track history of the user (everything they perform after logging in)
export const Dashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, activities, totalDonated, totalGiven, totalRequested, myRatings, donations] =
      await Promise.all([
        User.findById(userId).select("-password").lean(),
        Activity.find({ user: userId })
          .populate("product", "productName UUID productImage")
          .sort({ createdAt: -1 })
          .lean(),
        Product.countDocuments({ addedBy: userId }),
        Product.countDocuments({ addedBy: userId, status: "given" }),
        Product.countDocuments({ "interestedUsers.user": userId }),
        Rating.find({ user: userId })
          .populate("product", "productName UUID")
          .lean(),
        Product.find({ addedBy: userId })
          .populate("interestedUsers.user", "username mail")
          .populate("givenTo", "username")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    return responseManager.success(
      res,
      200,
      "Dashboard track history loaded successfully",
      {
        user,
        activities,
        donations: donations || [],
        products: donations || [],
        stats: {
          totalDonated,
          totalGiven,
          totalRequested,
          totalReviews: myRatings.length,
          totalActivities: activities.length,
        },
        ratings: myRatings,
      }
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return responseManager.error(res, 500, "Unable to load dashboard");
  }
};
