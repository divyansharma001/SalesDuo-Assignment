import { Router } from 'express';
import { optimize } from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import { optimizeSchema } from '../validators/product.validator';
import { optimizeLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/optimize', optimizeLimiter, validate(optimizeSchema), optimize);

export default router;
