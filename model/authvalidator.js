import Joi from "joi";

const mailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,29}$/;
const usernameRegex = /^[A-Za-z\s]+$/;
const passwordRegex = /^(?=.*[A-Z])[A-Za-z\d@$!%*?&]{8,64}$/;

export const registerSchema = Joi.object({
  mail: Joi.string().pattern(mailRegex).required(),
  username: Joi.string().pattern(usernameRegex).required(),
  password: Joi.string().pattern(passwordRegex).required(),
  age: Joi.number().min(1).max(120).required(),
  address: Joi.string().required(),

  // age: Joi.string().pattern(age).required(),
});
