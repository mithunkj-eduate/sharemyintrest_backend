const Joi = require("joi");
const { model } = require("mongoose");

//validating register Schema
const registerSchema = async (val) => {
  const schema = Joi.object({
    user: Joi.string(),
    userName: Joi.string().required(),
    mobileNumber: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/),
    email: Joi.string().email(),
    password: Joi.string().required(),
  });

  const err = await schema.validate(val);
  return err;
};

module.exports = registerSchema;
