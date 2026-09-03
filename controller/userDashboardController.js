import User from "../model/userData.js";
import Product from "../model/productsData.js";
import Rating from "../model/ratings.js";
import Activity from "../model/activityData.js";
import { responseManager } from "../middleware/responseManager.js";

export const Dashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password");

    const products = await Product.find({
      addedBy: userId,
    });

    const ratings = await Rating.find({
      user: userId,
    }).populate("product");

    const activities = await Activity.find({
      user: userId,
    })
      .populate("product")
      .sort({ createdAt: -1 })
      .limit(10);

    const productIds = products.map((product) => product._id);

    const receivedRatings = await Rating.find({
      product: { $in: productIds },
    }).populate("user", "username");

    return responseManager.success(res, 200, "Dashboard loaded successfully", {
      user,
      products,
      ratings,
      receivedRatings,
      activities,
    });
  } catch (error) {
    console.log(error);

    return responseManager.error(res, 500, "Unable to load dashboard");
  }
};
