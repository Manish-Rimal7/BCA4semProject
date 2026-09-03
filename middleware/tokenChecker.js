import userData from "../model/userData.js";
import jsonwebtoken from "jsonwebtoken";
import { responseManager } from "./responseManager.js";
import { env } from "../env.js";

const credential = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return responseManager.error(res, 404, "no header found");
  }
  if (!header.startsWith("Bearer ")) {
    return responseManager.error(res, 404, "invalid ");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jsonwebtoken.verify(token, env.JWT_SECRET);
    if (!decoded) {
      return responseManager.error(res, 404, "not decoded");
    }
    const user = await userData.findById(decoded.id);
    // user = await userData.findById(decoded.id);
    if (!user) {
      // user = await user.findById(decoded.id);
      return responseManager.error(res, 404, "user not found");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error at JWT Middleware", error);
    return responseManager.error(res, 404, "error occured");
  }
};
export default credential;
