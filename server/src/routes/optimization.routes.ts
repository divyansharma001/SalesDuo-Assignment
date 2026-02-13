import { Router } from 'express';
import { getHistory, getRecent, getById } from '../controllers/optimization.controller';

const router = Router();

router.get('/recent', getRecent);
router.get('/history/:asin', getHistory);
router.get('/:id', getById);

export default router;
