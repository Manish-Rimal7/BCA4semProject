import Activity from "../model/activityData.js";

export const makeActivity = async (
  user,
  activity,
  product = null,
  details = ""
) => {
  try {
    let pId = null;
    let pName = null;

    if (product) {
      if (typeof product === "object" && product._id) {
        pId = product._id.toString();
        pName = product.productName || null;
      } else {
        pId = product.toString();
      }
    }

    const newActivity = await Activity.create({
      user,
      activity,
      product: pId,
      productId: pId,
      productName: pName,
      details,
    });

    return newActivity;
  } catch (error) {
    console.log("Error creating activity:", error);

    return null;
  }
};
