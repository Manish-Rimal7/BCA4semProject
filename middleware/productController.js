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
  } = req.body;

  const finalLocation = location || productUseful;
  const finalCondition = condition || productModel;
  const finalDescription = description || productFeatures;

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
      newProduct
    );
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 500, `Error ${error}`);
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { isApproved: true };
    const products = await Product.find(filter)
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username mail");
    return responseManager.success(
      res,
      200,
      "All products fetched successfully",
      products
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
      .populate("givenTo", "username mail");

    return responseManager.success(
      res,
      200,
      isInterested ? "Interest expressed successfully" : "Interest removed",
      updatedProduct
    );
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const giveProduct = async (req, res) => {
  const { UUID } = req.params;
  const { recipientId } = req.body;
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

    product.givenTo = recipientId;
    product.status = "given";
    await product.save();

    await makeActivity(
      userId,
      "PRODUCT_GIVEN",
      product._id,
      `Assigned product "${product.productName}" to a neighbour`
    );

    const updatedProduct = await Product.findOne(filter)
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username mail");

    return responseManager.success(res, 200, "Item assigned successfully!", updatedProduct);
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const approveProduct = async (req, res) => {
  const { UUID } = req.params;
  try {
    const product = await Product.findOne({ UUID });
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
      product._id,
      `Product "${product.productName}" approved by admin`
    );

    return responseManager.success(res, 200, "Product approved successfully", product);
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error");
  }
};

export const rejectProduct = async (req, res) => {
  const { UUID } = req.params;
  try {
    const product = await Product.findOne({ UUID });
    if (!product) {
      return responseManager.error(res, 404, "Product not found");
    }

    if (product.status === "given" || product.givenTo) {
      return responseManager.error(
        res,
        400,
        "Cannot revoke approval for an item that has already been given away"
      );
    }

    product.isApproved = false;
    product.approvalStatus = "rejected";
    await product.save();

    await makeActivity(
      req.user._id,
      "PRODUCT_REJECTED",
      product._id,
      `Product "${product.productName}" rejected by admin`
    );

    return responseManager.success(res, 200, "Product rejected successfully", product);
  } catch (error) {
    console.error(error);
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
      .populate("givenTo", "username mail");

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    const ratings = await Rating.find({
      product: product._id,
    }).populate("user", "username");

    return responseManager.success(res, 200, "Product fetched successfully", {
      product,
      ratings,
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
    const product = await Product.findOne({ UUID });

    if (!product) {
      return responseManager.error(res, 404, "Product does not exist");
    }

    if (product.addedBy.toString() !== req.user._id.toString()) {
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
      "product deleted",
      productId,
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

    const allProducts = await Product.find({})
      .populate("addedBy", "username mail")
      .populate("interestedUsers.user", "username mail")
      .populate("givenTo", "username mail");

    const requestedProducts = allProducts.filter((product) => {
      if (!product.interestedUsers || !Array.isArray(product.interestedUsers)) return false;
      return product.interestedUsers.some((u) => {
        const uId = u?.user?._id || u?.user || u;
        return uId && uId.toString() === userId.toString();
      });
    });

    const giftedProducts = allProducts.filter((product) => {
      if (!product.givenTo) return false;
      const gId = product.givenTo._id || product.givenTo;
      return gId && gId.toString() === userId.toString();
    });

    return responseManager.success(res, 200, "User requests and gifts fetched successfully", {
      requestedProducts,
      giftedProducts,
    });
  } catch (error) {
    console.error("Error fetching my requests:", error);
    return responseManager.error(res, 500, "Server error");
  }
};
