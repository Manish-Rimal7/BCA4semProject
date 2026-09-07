import User from "../model/userData.js";
import Product from "../model/productsData.js";
import Category from "../model/categoryData.js";
import Rating from "../model/ratings.js";
import Activity from "../model/activityData.js";
import { responseManager } from "../middleware/responseManager.js";

export const AdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalCategories = await Category.countDocuments();

    const totalRatings = await Rating.countDocuments();

    const allUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingProducts = await Product.find({ isApproved: false })
      .populate("addedBy", "username mail")
      .sort({ createdAt: -1 });

    const recentActivities = await Activity.find()
      .populate("user", "username")
      .populate("product", "productName")
      .sort({ createdAt: -1 })
      .limit(15);

    // Identify pending products submitted under a category that is not yet in MongoDB
    const activeCategories = await Category.find({ status: "active" });
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
