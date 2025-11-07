import Joi from "joi";

const userSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
});

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      details: error.details[0].message,
    });
  }

  next();
};
