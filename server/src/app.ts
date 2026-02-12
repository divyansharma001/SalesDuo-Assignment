import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        success: true, 
        message: 'System operational',
        timestamp: new Date().toISOString()
    });
});

export default app;