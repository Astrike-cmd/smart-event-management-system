import { getDatabaseState } from '../config/db.js';

export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running successfully.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeInSeconds: Number(process.uptime().toFixed(2)),
    database: getDatabaseState()
  });
};
