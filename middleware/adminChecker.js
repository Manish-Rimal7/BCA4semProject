import { responseManager } from "./responseManager.js";

const adminChecker = async (req, res, next) => {
  try {
    if (!req.user) {
      return responseManager.error(res, 401, "user not found");
    }

    if (req.user.role !== "admin") {
      return responseManager.error(res, 403, "user is not a admin");
    }

    next();
  } catch (error) {
    console.error(error);

    return responseManager.error(res, 500, "Authorization error");
  }
};

export default adminChecker;
