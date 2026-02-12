import { Router } from 'express';
import { getHistory, getById } from '../controllers/optimization.controller';

const router = Router();

router.get('/history/:asin', getHistory);
router.get('/:id', getById);

export default router;
