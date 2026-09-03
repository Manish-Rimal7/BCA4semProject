import User from "../model/userData.js";
import crypto from "crypto";

const addUser = async (req, res) => {
  const { username, address, age, mail, password } = req.body;

  if ((!username, !address, !age, !mail, !password)) {
    return res.status(409).json({ msg: "missing fields " });
  }
  try {
    const existingUser = await User.findOne({ mail });
    if (existingUser) {
      return res.status(409).json({ msg: "user already exist" });
    }
    const newuser = new User({
      id: crypto.randomInt(1000, 9999),
      username,
      address,
      age,
      mail,
      password,
    });
    await User.save();
  } catch (error) {
    return res.status(404).json({ msg: "error occured" });
  }
};
