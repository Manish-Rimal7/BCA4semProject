import Joi from "joi";

const mailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,29}$/;
const usernameRegex = /^[A-Za-z\s]+$/;
const passwordRegex = /^(?=.*[A-Z]).{8,64}$/;

export const registerSchema = Joi.object({
  mail: Joi.string().pattern(mailRegex).optional(),
  email: Joi.string().pattern(mailRegex).optional(),
  username: Joi.string().pattern(usernameRegex).required(),
  password: Joi.string().pattern(passwordRegex).required(),
  age: Joi.any().optional(),
  address: Joi.any().optional(),
  role: Joi.string().valid("admin", "user").optional(),
}).unknown(true);
