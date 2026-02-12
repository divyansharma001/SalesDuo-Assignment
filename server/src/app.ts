import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import productRoutes from './routes/product.routes';
import optimizationRoutes from './routes/optimization.routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(helmet());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'System operational',
        timestamp: new Date().toISOString(),
    });
});

// Routes
app.use('/api/products', productRoutes);
app.use('/api/optimizations', optimizationRoutes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
