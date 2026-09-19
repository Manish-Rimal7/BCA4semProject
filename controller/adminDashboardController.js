import User from "../model/userData.js";
import Product from "../model/productsData.js";
import Category from "../model/categoryData.js";
import Rating from "../model/ratings.js";
import Activity from "../model/activityData.js";
import { responseManager } from "../middleware/responseManager.js";

export const AdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalRatings,
      allUsers,
      recentProducts,
      pendingProducts,
      recentActivities,
      activeCategories,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Category.countDocuments(),
      Rating.countDocuments(),
      User.find().select("-password").sort({ createdAt: -1 }).lean(),
      Product.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ isApproved: false })
        .populate("addedBy", "username mail")
        .sort({ createdAt: -1 })
        .lean(),
      Activity.find()
        .populate("user", "username")
        .populate("product", "productName")
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      Category.find({ status: "active" }).lean(),
    ]);

    // Identify pending products submitted under a category that is not yet in MongoDB
    const dbCatNamesLower = new Set(activeCategories.map((c) => c.name.toLowerCase()));

    const newCategoryAlerts = pendingProducts.filter(
      (p) => p.productCategory && !dbCatNamesLower.has(p.productCategory.trim().toLowerCase())
    );

    return responseManager.success(
      res,
      200,
      "Admin dashboard loaded successfully",
      {
        statistics: {
          totalUsers,
          totalProducts,
          totalCategories,
          totalRatings,
          pendingApprovals: pendingProducts.length,
          newCategoryAlertsCount: newCategoryAlerts.length,
        },

        allUsers,
        recentUsers: allUsers.slice(0, 5),

        recentProducts,

        pendingProducts,

        newCategoryAlerts,

        recentActivities,
      }
    );
  } catch (error) {
    console.log(error);

    return responseManager.error(res, 500, "Unable to load admin dashboard");
  }
};
