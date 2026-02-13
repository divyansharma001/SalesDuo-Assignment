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
  marketplace: Joi.string()
    .valid('amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.ca')
    .default('amazon.in')
    .messages({
      'any.only': 'Marketplace must be one of: amazon.com, amazon.in, amazon.co.uk, amazon.de, amazon.ca',
    }),
});
