import { Router } from 'express';
import { getHistory, getRecent, getById, deleteByAsin } from '../controllers/optimization.controller';

const router = Router();

router.get('/recent', getRecent);
router.get('/history/:asin', getHistory);
router.get('/:id', getById);
router.delete('/history/:asin', deleteByAsin);

export default router;
