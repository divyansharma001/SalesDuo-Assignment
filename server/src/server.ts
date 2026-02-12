import app from './app';
import config from './config/env';
import db from './database/db';

const startServer = async () => {
    try {
        await db.raw('SELECT 1');
        console.log('Database connected successfully');
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (error) {
        console.error('Server failed to start:', error);
        process.exit(1);
    }
};

startServer();