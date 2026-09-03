import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { env } from "../env.js";
import user from "../model/userData.js";
import { responseManager } from "../middleware/responseManager.js";

export const userRegistration = async (req, res) => {
  const { username, address, age, mail, password } = req.body;

  try {
    const existingUser = await user.findOne({ mail });
    if (existingUser) {
      return responseManager.error(res, 409, "user already exists");
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      username,
      address,
      age,
      mail,
      password: hashedpassword,
    });
    await newUser.save();
    return responseManager.success(res, 201, "user registration success");
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 409, "invalid credentials");
  }
};

export const userLogin = async (req, res) => {
  const { mail, password } = req.body;

  try {
    const existingUser = await user.findOne({ mail });
    if (!existingUser) {
      return responseManager.error(res, 409, "unable to find user");
    }
    const verify = await bcrypt.compare(password, existingUser.password);
    if (!verify) {
      return responseManager.error(res, 409, "password doesnot match ");
    }
    const token = jsonwebtoken.sign(
      {
        id: existingUser._id,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWTEXPIRY,
      }
    );
    return responseManager.success(res, 201, "user logged in successfully", {
      token,
      user: {
        id: existingUser._id,
        username: existingUser.username,
        mail: existingUser.mail,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 409, "invalid credentials");
  }
};
