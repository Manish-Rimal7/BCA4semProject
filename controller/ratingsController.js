import Product from "../model/productsData.js";
import RatingModel from "../model/ratings.js";
import { responseManager } from "../middleware/responseManager.js";
import { makeActivity } from "../services/activityService.js";
import { sendReviewEmail } from "../services/emailService.js";

export const addRating = async (req, res) => {
  const { UUID } = req.params;
  const { rating, productRating, donorRating, comment, experienceType } = req.body;

  const Rating = Number(productRating || rating || donorRating);

  if (!Number.isInteger(Rating) || Rating < 1 || Rating > 5) {
    return responseManager.error(
      res,
      400,
      "Rating must be an integer between 1 and 5"
    );
  }

  try {
    // If no UUID, or general/platform rating
    if (!UUID || UUID === "general" || UUID === "platform") {
      const newRating = await RatingModel.create({
        product: null,
        user: req.user._id,
        rating: Rating,
        comment: comment || "",
        experienceType: experienceType || "general",
      });

      await makeActivity(
        req.user._id,
        "rating added",
        null,
        `You submitted a community rating of ${Rating} stars`
      );

      // Send email notification for review
      await sendReviewEmail({
        username: req.user?.username || "Anonymous User",
        userEmail: req.user?.mail || req.user?.email || "unknown@renest.org",
        rating: Rating,
        comment: comment || "",
        experienceType: newRating.experienceType,
        productName: "Platform",
      }).catch((err) => console.error("Failed to send review email:", err));

      return responseManager.success(res, 201, "Successfully rated", {
        rating: Rating,
        experienceType: newRating.experienceType,
      });
    }

    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter);

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    // Donors cannot rate their own products
    if (product.addedBy && product.addedBy.toString() === req.user._id.toString()) {
      return responseManager.error(
        res,
        403,
        "Donors cannot rate their own products."
      );
    }

    // Only the recipient who was given the product can rate
    const isReceiver = Boolean(
      (product.givenTo && product.givenTo.toString() === req.user._id.toString()) ||
      (product.givenRecipients && product.givenRecipients.some(
        (g) => g.user && g.user.toString() === req.user._id.toString()
      ))
    );

    if (!isReceiver) {
      return responseManager.error(
        res,
        403,
        "Only the recipient who received this item from the donor can rate this product and donor."
      );
    }

    const pRating = Number(req.body.productRating || req.body.rating || Rating);
    const dRating = Number(req.body.donorRating || req.body.rating || Rating);

    if (!Number.isInteger(pRating) || pRating < 1 || pRating > 5) {
      return responseManager.error(res, 400, "Product rating must be an integer between 1 and 5");
    }
    if (!Number.isInteger(dRating) || dRating < 1 || dRating > 5) {
      return responseManager.error(res, 400, "Donor rating must be an integer between 1 and 5");
    }

    const existingRating = await RatingModel.findOne({
      product: product._id,
      user: req.user._id,
    });

    let action;

    if (existingRating) {
      existingRating.rating = pRating;
      existingRating.productRating = pRating;
      existingRating.donorRating = dRating;
      existingRating.donor = product.addedBy;
      if (comment !== undefined) existingRating.comment = comment;
      existingRating.experienceType = "receiver";
      await existingRating.save();

      action = "rating updated";
    } else {
      await RatingModel.create({
        product: product._id,
        donor: product.addedBy,
        user: req.user._id,
        rating: pRating,
        productRating: pRating,
        donorRating: dRating,
        comment: comment || "",
        experienceType: "receiver",
      });
      action = "rating added";
    }

    // Calculate average rating strictly from other users (exclude product owner)
    const everyRatings = await RatingModel.find({
      product: product._id,
      user: { $ne: product.addedBy },
    });

    let totalRating = 0;
    for (let i = 0; i < everyRatings.length; i++) {
      totalRating = totalRating + (everyRatings[i].productRating || everyRatings[i].rating);
    }

    product.averageRating = everyRatings.length > 0 ? (totalRating / everyRatings.length) : 0;

    await product.save();

    await makeActivity(
      req.user._id,
      action,
      product._id,
      `You rated "${product.productName}" (${pRating}★) and the donor (${dRating}★)`
    );

    // Send email notification for review
    await sendReviewEmail({
      username: req.user?.username || "Anonymous User",
      userEmail: req.user?.mail || req.user?.email || "unknown@renest.org",
      rating: dRating,
      comment: comment || "",
      experienceType: "receiver",
      productName: product.productName || "Product",
    }).catch((err) => console.error("Failed to send review email:", err));

    return responseManager.success(res, 201, "Successfully rated product and donor", {
      productRating: pRating,
      donorRating: dRating,
      averageRating: product.averageRating,
    });
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await RatingModel.find()
      .populate("user", "username mail")
      .populate({
        path: "product",
        select: "productName UUID condition location addedBy",
        populate: { path: "addedBy", select: "username mail" },
      })
      .sort({ createdAt: -1 });

    return responseManager.success(
      res,
      200,
      "Ratings fetched successfully",
      ratings
    );
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return responseManager.error(res, 500, "Server error");
  }
};
