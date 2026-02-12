import { Request, Response, NextFunction } from 'express';
import { optimizeByAsin } from '../services/product.service';

export async function optimize(req: Request, res: Response, next: NextFunction) {
  try {
    const { asin } = req.body;
    const result = await optimizeByAsin(asin.toUpperCase());
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
