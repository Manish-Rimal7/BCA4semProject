import userData from "../model/userData.js";
import jsonwebtoken from "jsonwebtoken";
import { responseManager } from "./responseManager.js";
import { env } from "../env.js";

const credential = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return responseManager.error(res, 401, "No authorization header found");
  }
  if (!header.startsWith("Bearer ")) {
    return responseManager.error(res, 401, "Invalid token format");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jsonwebtoken.verify(token, env.JWT_SECRET);
    if (!decoded || (!decoded.id && !decoded._id)) {
      return responseManager.error(res, 401, "Invalid or expired token");
    }
    const userId = decoded.id || decoded._id;
    const user = await userData.findById(userId);
    if (!user) {
      return responseManager.error(res, 401, "User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error at JWT Middleware", error);
    return responseManager.error(res, 401, "Unauthorized or expired token");
  }
};
export default credential;
