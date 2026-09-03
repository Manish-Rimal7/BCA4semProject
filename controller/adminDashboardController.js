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

    const recentUsers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentActivities = await Activity.find()
      .populate("user", "username")
      .populate("product", "productName")
      .sort({ createdAt: -1 })
      .limit(10);

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
        },

        recentUsers,

        recentProducts,

        recentActivities,
      }
    );
  } catch (error) {
    console.log(error);

    return responseManager.error(res, 500, "Unable to load admin dashboard");
  }
};
