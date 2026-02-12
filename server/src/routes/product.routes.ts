import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optimize } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { optimizeSchema } from '../validators/product.validator';

const router = Router();

const optimizeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: { message: 'Too many requests. Please try again later.' },
  },
});

router.post('/optimize', optimizeLimiter, validate(optimizeSchema), optimize);

export default router;
