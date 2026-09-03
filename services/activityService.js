import Activity from "../model/activityData.js";

export const makeActivity = async (
  user,
  activity,
  product = null,
  details = ""
) => {
  try {
    const newActivity = await Activity.create({
      user,
      activity,
      product,
      details,
    });

    return newActivity;
  } catch (error) {
    console.log("Error creating activity:", error);

    return null;
  }
};
