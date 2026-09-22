import User from "../model/userData.js";
import Product from "../model/productsData.js";
import Rating from "../model/ratings.js";
import Activity from "../model/activityData.js";
import { responseManager } from "../middleware/responseManager.js";

export const Dashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, products, ratings, activities] = await Promise.all([
      User.findById(userId).select("-password").lean(),
      Product.find({ addedBy: userId })
        .populate("interestedUsers.user", "username mail")
        .populate("givenTo", "username")
        .sort({ createdAt: -1 })
        .lean(),
      Rating.find({ user: userId }).populate("product", "productName UUID").lean(),
      Activity.find({ user: userId })
        .populate("product", "productName UUID")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const productIds = products.map((product) => product._id);

    const receivedRatings = await Rating.find({
      $or: [
        ...(productIds.length > 0 ? [{ product: { $in: productIds } }] : []),
        { donor: userId },
      ],
      user: { $ne: userId },
    })
      .populate("user", "username")
      .populate("product", "productName UUID")
      .lean();

    const productsWithRatings = products.map((product) => {
      const prodRatings = receivedRatings.filter(
        (r) =>
          r.product &&
          (r.product._id || r.product).toString() === product._id.toString()
      );
      return {
        ...product,
        ratings: prodRatings,
      };
    });

    return responseManager.success(res, 200, "Dashboard loaded successfully", {
      user,
      products: productsWithRatings,
      ratings: receivedRatings,
      receivedRatings,
      activities,
    });
  } catch (error) {
    console.log(error);

    return responseManager.error(res, 500, "Unable to load dashboard");
  }
};
