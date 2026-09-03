import Product from "../model/productsData.js";
import RatingModel from "../model/ratings.js";
import { responseManager } from "../middleware/responseManager.js";
import { makeActivity } from "../services/activityService.js";

export const addRating = async (req, res) => {
  const { UUID } = req.params;
  const { rating } = req.body;

  if (!UUID) {
    return responseManager.error(res, 400, "UUID not found");
  }

  const Rating = Number(rating);

  if (!Number.isInteger(Rating) || Rating < 1 || Rating > 5) {
    return responseManager.error(
      res,
      400,
      "Rating must be an integer between 1 and 5"
    );
  }

  try {
    const product = await Product.findOne({ UUID });

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    const existingRating = await RatingModel.findOne({
      product: product._id,
      user: req.user._id,
    });

    let action;

    if (existingRating) {
      existingRating.rating = Rating;
      await existingRating.save();

      action = "rating updated";
    } else {
      await RatingModel.create({
        product: product._id,
        user: req.user._id,
        rating: Rating,
      });
      action = "rating added";
    }

    const everyRatings = await RatingModel.find({
      product: product._id,
    });

    let totalRating = 0;

    for (let i = 0; i < everyRatings.length; i++) {
      totalRating = totalRating + everyRatings[i].rating;
    }

    product.averageRating = totalRating / everyRatings.length;

    await product.save();

    await makeActivity(
      req.user._id,
      action,
      product._id,
      `You rated "${product.productName}" with ${Rating} stars`
    );
    return responseManager.success(res, 201, "Successfully rated", {
      rating: Rating,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};
