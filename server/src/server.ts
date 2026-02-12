import app from './app';
import config from './config/env';
import { pool } from './database/db';

const startServer = async () => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
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
