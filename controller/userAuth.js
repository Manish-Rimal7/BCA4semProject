import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { env } from "../env.js";
import user from "../model/userData.js";
import { responseManager } from "../middleware/responseManager.js";

export const userRegistration = async (req, res) => {
  const { username, address, age, mail, password, role } = req.body;

  try {
    const existingUser = await user.findOne({ mail });
    if (existingUser) {
      return responseManager.error(res, 409, "user already exists");
    }
    const count = await user.countDocuments();
    // Default the first registered user or explicitly requested admin role to "admin"
    const assignedRole = count === 0 || role === "admin" ? "admin" : (role || "user");
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      username,
      address,
      age,
      mail,
      password: hashedpassword,
      role: assignedRole,
    });
    await newUser.save();
    return responseManager.success(res, 201, "user registration success", {
      user: {
        id: newUser._id,
        username: newUser.username,
        mail: newUser.mail,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 409, "invalid credentials");
  }
};

export const userLogin = async (req, res) => {
  const { mail, password } = req.body;

  try {
    if (!mail || !password) {
      return responseManager.error(res, 400, "Email and password are required");
    }

    const cleanMail = typeof mail === "string" ? mail.trim() : mail;
    const existingUser = await user.findOne({ mail: cleanMail });
    if (!existingUser) {
      return responseManager.error(res, 400, "Invalid email or password");
    }
    const verify = await bcrypt.compare(password, existingUser.password);
    if (!verify) {
      return responseManager.error(res, 400, "Invalid email or password");
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
        address: existingUser.address,
        age: existingUser.age,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return responseManager.error(res, 409, "invalid credentials");
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { username, address, age, password } = req.body;

  try {
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return responseManager.error(res, 404, "User not found");
    }

    if (username && username.trim()) {
      existingUser.username = username.trim();
    }
    if (address && address.trim()) {
      existingUser.address = address.trim();
    }
    if (age !== undefined && age !== null && !isNaN(Number(age))) {
      existingUser.age = Number(age);
    }
    if (password && password.trim()) {
      existingUser.password = await bcrypt.hash(password.trim(), 10);
    }

    await existingUser.save();

    return responseManager.success(res, 200, "Profile updated successfully", {
      user: {
        id: existingUser._id,
        username: existingUser.username,
        mail: existingUser.mail,
        address: existingUser.address,
        age: existingUser.age,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Server error updating profile");
  }
};

export const getMe = async (req, res) => {
  try {
    const currentUser = await user.findById(req.user._id).select("-password");
    if (!currentUser) {
      return responseManager.error(res, 404, "User not found");
    }
    return responseManager.success(res, 200, "User profile retrieved", {
      user: {
        id: currentUser._id,
        username: currentUser.username,
        mail: currentUser.mail,
        address: currentUser.address,
        age: currentUser.age,
        role: currentUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Error retrieving profile");
  }
};

export const toggleAdminRole = async (req, res) => {
  try {
    const currentUser = await user.findById(req.user._id);
    if (!currentUser) {
      return responseManager.error(res, 404, "User not found");
    }
    currentUser.role = currentUser.role === "admin" ? "user" : "admin";
    await currentUser.save();
    return responseManager.success(
      res,
      200,
      `Role switched to ${currentUser.role}`,
      {
        user: {
          id: currentUser._id,
          username: currentUser.username,
          mail: currentUser.mail,
          address: currentUser.address,
          age: currentUser.age,
          role: currentUser.role,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return responseManager.error(res, 500, "Error updating role");
  }
};
