import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../utils/ApiError';

export function validate(schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const details = error.details.map((d) => d.message).join(', ');
      return next(new ApiError(400, `Validation failed: ${details}`));
    }
    req[property] = value;
    next();
  };
}
