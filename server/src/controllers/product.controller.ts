import { Request, Response, NextFunction } from 'express';
import { optimizeByAsin } from '../services/product.service';

export async function optimize(req: Request, res: Response, next: NextFunction) {
  try {
    const { asin, marketplace = 'amazon.in' } = req.body;
    const result = await optimizeByAsin(asin.toUpperCase(), marketplace);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
