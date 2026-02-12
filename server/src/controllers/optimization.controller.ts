import { Request, Response, NextFunction } from 'express';
import { OptimizationModel } from '../models/optimization.model';
import { ApiError } from '../utils/ApiError';

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const { asin } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const upperAsin = asin.toUpperCase();
    const optimizations = await OptimizationModel.findByAsin(upperAsin, { limit, offset });
    const total = await OptimizationModel.countByAsin(upperAsin);

    res.json({
      success: true,
      data: { asin: upperAsin, optimizations, total, limit, offset },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid optimization ID');
    }

    const optimization = await OptimizationModel.findByIdWithProduct(id);
    if (!optimization) {
      throw new ApiError(404, `Optimization with id ${id} not found`);
    }

    res.json({ success: true, data: optimization });
  } catch (err) {
    next(err);
  }
}
