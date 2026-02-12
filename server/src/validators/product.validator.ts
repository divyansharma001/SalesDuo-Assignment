import Joi from 'joi';

export const optimizeSchema = Joi.object({
  asin: Joi.string()
    .alphanum()
    .length(10)
    .required()
    .messages({
      'string.alphanum': 'ASIN must contain only letters and numbers',
      'string.length': 'ASIN must be exactly 10 characters',
      'any.required': 'ASIN is required',
    }),
});
