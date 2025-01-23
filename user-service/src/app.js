import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

// API Routes
app.use('/api/identity', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

export default app;
