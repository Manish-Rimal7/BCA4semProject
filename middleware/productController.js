// import Product from "../model/productsData.js";
// import { responseManager } from "./responseManager.js";
// import Rating from "../model/ratings.js";
// import crypto from "crypto";
// import { makeActivity } from "../services/activityService.js";

// export const addProduct = async (req, res) => {
//   const {
//     productName,
//     productCategory,
//     productUseful,
//     productModel,
//     productFeatures,
//   } = req.body;

//   if (
//     !productName ||
//     !productCategory ||
//     !productUseful ||
//     !productModel ||
//     !productFeatures
//   ) {
//     return responseManager.error(res, 400, "All fields are required");
//   }

//   try {
//     const newProduct = new Product({
//       UUID: crypto.randomUUID(),
//       productName,
//       productCategory,
//       productUseful,
//       productModel,
//       productFeatures,
//       addedBy: req.user._id,
//     });

//     await newProduct.save();

//     await makeActivity(
//       req.user._id,
//       "PRODUCT_ADDED",
//       newProduct._id,
//       `Product "${productName}" added to the list`
//     );

//     return responseManager.success(
//       res,
//       201,
//       "Product added to the list",
//       newProduct
//     );
//   } catch (error) {
//     console.log(error);
//     return responseManager.error(res, 500, `Error ${error}`);
//   }
// };

// export const getProduct = async (req, res) => {
//   const { UUID } = req.params;

//   if (!UUID) {
//     return responseManager.error(res, 400, "Product UUID is required");
//   }

//   try {
//     const product = await Product.findOne({ UUID }).populate(
//       "addedBy",
//       "username mail"
//     );

//     if (!product) {
//       return responseManager.error(res, 404, "Product does not exist");
//     }

//     const ratings = await Rating.find({
//       product: product._id,
//     }).populate("user", "username");

//     return responseManager.success(res, 200, {
//       product,
//       ratings,
//     });
//   } catch (error) {
//     console.log(error);
//     return responseManager.error(res, 500, "Server error");
//   }
// };

// export const deleteProduct = async (req, res) => {
//   const { UUID } = req.params;

//   if (!UUID) {
//     return responseManager.error(res, 400, "Product UUID is required");
//   }

//   try {
//     const product = await Product.findOne({ UUID });

//     if (!product) {
//       return responseManager.error(res, 404, "Product does not exist");
//     }

//     if (product.addedBy.toString() !== req.user._id.toString()) {
//       return responseManager.error(
//         res,
//         403,
//         "You are not allowed to delete this product"
//       );
//     }

//     const productId = product._id;
//     const productName = product.productName;

//     await product.deleteOne();

//     await makeActivity(
//       req.user._id,
//       "product deleted",
//       productId,
//       `Product "${productName}" deleted from the list`
//     );

//     return responseManager.success(res, 200, "Product deleted successfully");
//   } catch (error) {
//     console.log(error);
//     return responseManager.error(res, 500, "Server error");
//   }
// };

import Product from "../model/productsData.js";
import categoryData from "../model/categoryData.js";
import { responseManager } from "./responseManager.js";
import Rating from "../model/ratings.js";
import crypto from "crypto";
import { makeActivity } from "../services/activityService.js";

export const addProduct = async (req, res) => {
  const {
    productName,
    productCategory,
    location,
    condition,
    description,
    productUseful,
    productModel,
    productFeatures,
    productImage,
    quantity,
  } = req.body;

  const finalLocation = location || productUseful;
  const finalCondition = condition || productModel;
  const finalDescription = description || productFeatures;
  const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  if (
    !productName ||
    !productCategory ||
    !finalLocation ||
    !finalCondition ||
    !finalDescription
  ) {
    return responseManager.error(res, 400, "All fields are required");
  }

  try {
    const newProduct = new Product({
      UUID: crypto.randomUUID(),
      productName,
      productCategory,
      location: finalLocation,
      condition: finalCondition,
      description: finalDescription,
      productImage: productImage || "",
      quantity: parsedQuantity,
      initialQuantity: parsedQuantity,
      isApproved: false,
      approvalStatus: "pending",
      addedBy: req.user._id,
    });

    await newProduct.save();

    const catName = productCategory.trim();
    const existingCategory = await categoryData.findOne({
      name: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });

    const isNewCategory = !existingCategory;
    const activityType = isNewCategory ? "NEW_CATEGORY_SUGGESTED" : "PRODUCT_ADDED";
    const activityDetails = isNewCategory
      ? `User registered product "${productName}" under NEW category "${catName}" (not currently available in DB)`
      : `Product "${productName}" added to the list`;

    await makeActivity(
      req.user._id,
      activityType,
      newProduct._id,
      activityDetails
    );

    return responseManager.success(
      res,
      201,
      isNewCategory
        ? "Product submitted with new category suggestion — pending admin approval!"
        : "Product added to the list",
      sanitizeProductForUser(newProduct.toObject ? newProduct.toObject() : newProduct, req.user)
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, `Error ${error}`);
  }
};

export const sanitizeProductForUser = (prod, user) => {
  if (!prod) return prod;
  const currentUserId = user?._id || user?.id;
  const isAdmin = Boolean(user && user.role === "admin");
  const isDonor = Boolean(
    currentUserId &&
    prod.addedBy &&
    (prod.addedBy._id || prod.addedBy).toString() === currentUserId.toString()
  );
  const userInterested = Boolean(
    currentUserId &&
    prod.interestedUsers &&
    prod.interestedUsers.some(
      (u) => (u.user?._id || u.user)?.toString() === currentUserId.toString()
    )
  );
  const isRecipient = Boolean(
    currentUserId &&
    prod.givenTo &&
    (prod.givenTo._id || prod.givenTo).toString() === currentUserId.toString()
  );
  const count = prod.interestedUsers?.length || 0;

  // User details (addedBy):
  // ONLY the admin and the donor who is donating the product can view it.
  // Beside that, no one is allowed to view user details.
  const isPrivileged = isDonor || isAdmin;
  const sanitizedAddedBy = isPrivileged
    ? (prod.addedBy && typeof prod.addedBy === "object"
        ? {
            _id: prod.addedBy._id,
            username: prod.addedBy.username,
            ...(prod.addedBy.mail
              ? { mail: prod.addedBy.mail }
              : {}),
          }
        : prod.addedBy)
    : null;

  // Interested section (interestedUsers):
  // ONLY the admin and the donor who is donating the product can view it.
  // Beside that, no one is allowed to view the interested section and the user details.
  // Normal users ONLY see the count (interestedCount) and an empty list [].
  const sanitizedInterestedUsers = isPrivileged
    ? (prod.interestedUsers || []).map((entry) => ({
        _id: entry._id,
        message: entry.message,
        purpose: entry.purpose,
        interestedAt: entry.interestedAt,
        user: entry.user
          ? (typeof entry.user === "object"
              ? {
                  _id: entry.user._id,
                  username: entry.user.username,
                  ...(entry.user.mail
                    ? { mail: entry.user.mail }
                    : {}),
                }
              : entry.user)
          : entry.user,
      }))
    : [];

  const sanitizedGivenRecipients = isPrivileged
    ? (prod.givenRecipients || [])
    : [];

  const copy = { ...prod };
  delete copy.mail;
  delete copy.email;

  return {
    ...copy,
    addedBy: sanitizedAddedBy,
    interestedCount: count,
    isInterested: userInterested,
    interestedUsers: sanitizedInterestedUsers,
    givenRecipients: sanitizedGivenRecipients,
    givenTo: isPrivileged ? prod.givenTo : null,
    ratings: prod.ratings || copy.ratings || [],
  };
};

export const getAllProducts = async (req, res) => {
  try {
    let filter;
    if (req.query.all === "true") {
      filter = {};
    } else if (req.user && req.user._id) {
      filter = {
        isApproved: true,
        addedBy: { $ne: req.user._id },
        $or: [
          { status: { $ne: "given" } },
          {
            status: "given",
            "interestedUsers.user": req.user._id,
          },
        ],
      };
    } else {
      filter = {
        isApproved: true,
        status: { $ne: "given" },
      };
    }

    // Direct database filter by category
    if (req.query.category && req.query.category !== "all") {
      const catTrimmed = req.query.category.trim();
      filter.productCategory = new RegExp(`^${catTrimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    // Direct database search by term
    if (req.query.search && req.query.search.trim()) {
      const term = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(term, "i");
      const searchCondition = {
        $or: [
          { productName: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { productCategory: searchRegex },
        ],
      };
      if (filter.$or) {
        filter = {
          $and: [{ $or: filter.$or }, searchCondition],
          isApproved: filter.isApproved,
          ...(filter.addedBy ? { addedBy: filter.addedBy } : {}),
          ...(filter.productCategory ? { productCategory: filter.productCategory } : {}),
        };
      } else {
        filter.$or = searchCondition.$or;
      }
    }

    // Exclude specific product (e.g. for related items)
    if (req.query.exclude) {
      const excludeVal = req.query.exclude.trim();
      const isObjectId = excludeVal.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        filter._id = { $ne: excludeVal };
      }
      filter.UUID = { $ne: excludeVal };
    }

    const isPaginated = req.query.paginated === "true";
    const hasLimitOrPage = Boolean(req.query.limit || req.query.page);

    let query = Product.find(filter)
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username")
      .sort({ createdAt: -1 });

    let page = 1;
    let limit = 8;
    let total = 0;
    let totalPages = 1;

    if (isPaginated || hasLimitOrPage) {
      page = Math.max(1, parseInt(req.query.page, 10) || 1);
      limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 8));
      total = await Product.countDocuments(filter);
      totalPages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const products = await query.lean();

    // Restrict interested users visibility & emails confidential
    const sanitizedProducts = products.map((prod) => sanitizeProductForUser(prod, req.user));

    const productIds = sanitizedProducts.map((p) => p._id);
    const ratings = await Rating.find({ product: { $in: productIds } })
      .populate("user", "username")
      .lean();

    const productsWithRatings = sanitizedProducts.map((prod) => ({
      ...prod,
      ratings: ratings.filter(
        (r) => r.product && (r.product._id || r.product).toString() === prod._id.toString()
      ),
    }));

    if (isPaginated) {
      return responseManager.success(
        res,
        200,
        "Products fetched successfully",
        {
          products: productsWithRatings,
          total,
          page,
          totalPages,
          hasMore: page < totalPages,
        }
      );
    }

    return responseManager.success(
      res,
      200,
      "All products fetched successfully",
      productsWithRatings
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const toggleInterest = async (req, res) => {
  const { UUID } = req.params;
  const userId = req.user._id;
  const { purpose } = req.body;

  try {
    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter);
    if (!product) {
      return responseManager.error(res, 404, "Product not found");
    }

    if (product.addedBy.toString() === userId.toString()) {
      return responseManager.error(res, 400, "You cannot express interest in your own item");
    }

    const index = product.interestedUsers.findIndex((entry) => {
      const entryUserId = entry?.user?._id || entry?.user || entry;
      return entryUserId.toString() === userId.toString();
    });

    let isInterested = false;
    if (index === -1) {
      product.interestedUsers.push({
        user: userId,
        purpose: purpose || "",
        interestedAt: new Date(),
      });
      isInterested = true;
    } else {
      product.interestedUsers.splice(index, 1);
      isInterested = false;
    }

    await product.save();

    await makeActivity(
      userId,
      isInterested ? "INTEREST_ADDED" : "INTEREST_REMOVED",
      product._id,
      isInterested
        ? `Expressed interest in "${product.productName}"`
        : `Removed interest in "${product.productName}"`
    );

    const updatedProduct = await Product.findOne(filter)
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username")
      .lean();

    const sanitizedProduct = sanitizeProductForUser(updatedProduct, req.user);

    return responseManager.success(
      res,
      200,
      isInterested ? "Interest expressed successfully" : "Interest removed",
      sanitizedProduct
    );
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const giveProduct = async (req, res) => {
  const { UUID } = req.params;
  const { recipientId, quantityToGive } = req.body;
  const userId = req.user._id;

  if (!recipientId) {
    return responseManager.error(res, 400, "Recipient ID is required");
  }

  try {
    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter);

    if (!product) {
      return responseManager.error(res, 404, "Product not found");
    }

    if (product.addedBy.toString() !== userId.toString()) {
      return responseManager.error(res, 403, "Only the owner can assign this product");
    }

    const currentQty = typeof product.quantity === "number" ? product.quantity : 1;
    const toGive = Math.max(1, Math.min(parseInt(quantityToGive, 10) || 1, currentQty > 0 ? currentQty : 1));
    const remaining = Math.max(0, currentQty - toGive);

    product.quantity = remaining;
    if (!product.givenRecipients) {
      product.givenRecipients = [];
    }
    product.givenRecipients.push({
      user: recipientId,
      quantity: toGive,
      givenAt: new Date(),
    });
    product.givenTo = recipientId;

    if (remaining === 0) {
      product.status = "given";
    } else {
      product.status = "available";
    }

    await product.save();

    await makeActivity(
      userId,
      "PRODUCT_GIVEN",
      product,
      `Given ${toGive} unit(s) of "${product.productName}" to a neighbour (${remaining} remaining)`
    );

    const updatedProduct = await Product.findOne(filter)
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username")
      .populate("givenRecipients.user", "username")
      .lean();

    const sanitizedProduct = sanitizeProductForUser(updatedProduct, req.user);

    return responseManager.success(
      res,
      200,
      remaining > 0
        ? `Successfully assigned ${toGive} unit(s)! ${remaining} unit(s) remaining for donation.`
        : "Item fully given away!",
      sanitizedProduct
    );
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const approveProduct = async (req, res) => {
  const { UUID } = req.params;
  try {
    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter);
    if (!product) {
      return responseManager.error(res, 404, "Product not found");
    }
    product.isApproved = true;
    product.approvalStatus = "approved";
    await product.save();

    // After admin approval, save category directly to MongoDB if not already present
    if (product.productCategory) {
      const catName = product.productCategory.trim();
      const existingCategory = await categoryData.findOne({
        name: new RegExp(`^${catName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
      if (!existingCategory) {
        await categoryData.create({
          name: catName,
          categoryType: "General",
          status: "active",
        });
      }
    }

    await makeActivity(
      req.user._id,
      "PRODUCT_APPROVED",
      product,
      `Product "${product.productName}" approved by admin`
    );

    return responseManager.success(
      res,
      200,
      "Product approved successfully",
      sanitizeProductForUser(product.toObject ? product.toObject() : product, req.user)
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const rejectProduct = async (req, res) => {
  const { UUID } = req.params;
  try {
    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter);
    if (!product) {
      return responseManager.error(res, 404, "Product not found");
    }
    product.isApproved = false;
    product.approvalStatus = "rejected";
    await product.save();

    await makeActivity(
      req.user._id,
      "PRODUCT_REJECTED",
      product,
      `Product "${product.productName}" approval rejected/revoked by admin`
    );

    return responseManager.success(
      res,
      200,
      "Product rejected successfully",
      sanitizeProductForUser(product.toObject ? product.toObject() : product, req.user)
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const getProduct = async (req, res) => {
  const { UUID } = req.params;

  if (!UUID) {
    return responseManager.error(res, 400, "Product UUID is required");
  }

  try {
    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter)
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username")
      .populate("givenRecipients.user", "username")
      .lean();

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    const ratings = await Rating.find({
      product: product._id,
    })
      .populate("user", "username")
      .lean();

    const sanitizedProduct = sanitizeProductForUser(product, req.user);
    sanitizedProduct.ratings = ratings;

    return responseManager.success(res, 200, "Product fetched successfully", {
      product: sanitizedProduct,
    });
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const deleteProduct = async (req, res) => {
  const { UUID } = req.params;

  if (!UUID) {
    return responseManager.error(res, 400, "Product UUID is required");
  }

  try {
    const isObjectId = UUID.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { $or: [{ UUID }, { _id: UUID }] } : { UUID };
    const product = await Product.findOne(filter);

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    if (
      product.addedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return responseManager.error(
        res,
        403,
        "You are not allowed to delete this product"
      );
    }

    const productId = product._id;
    const productName = product.productName;

    await product.deleteOne();

    await makeActivity(
      req.user._id,
      "PRODUCT_DELETED",
      { _id: productId, productName },
      `Product "${productName}" deleted from the list`
    );

    return responseManager.success(res, 200, "Product deleted successfully");
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const [requestedProducts, giftedProducts] = await Promise.all([
      Product.find({
        "interestedUsers.user": userId,
      })
        .populate("addedBy", "username")
        .populate("interestedUsers.user", "username")
        .populate("givenTo", "username")
        .sort({ createdAt: -1 })
        .lean(),
      Product.find({
        givenTo: userId,
      })
        .populate("addedBy", "username")
        .populate("interestedUsers.user", "username")
        .populate("givenTo", "username")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const sanitizedRequested = requestedProducts.map((p) => sanitizeProductForUser(p, req.user));
    const sanitizedGifted = giftedProducts.map((p) => sanitizeProductForUser(p, req.user));

    return responseManager.success(res, 200, "User requests and gifts fetched successfully", {
      requestedProducts: sanitizedRequested,
      giftedProducts: sanitizedGifted,
    });
  } catch (error) {
    console.error("Error fetching my requests:", error);
    return responseManager.error(res, 500, "Server error");
  }
};
