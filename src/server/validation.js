import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string()
    .required()
    .max(50)
    .trim()
    .regex(/^(?=.*\p{L})[\p{L} ]+$/u)
    .label("Name")
    .messages({
      "string.pattern.base": "Name accepts only spaces and characters!",
    }),
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().required().min(8).label("Password"),
  re_password: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Repeat password")
    .messages({ "any.only": "{{#label}} does not match!" }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string().required().min(8).label("Password"),
});

export const queryValidation = (offset, limit, order = "ASC") =>
  Joi.object({
    offset: Joi.number().default(offset),
    limit: Joi.number().min(0).default(limit),
    order: Joi.string().valid("ASC", "DESC").default("ASC"),
  });
