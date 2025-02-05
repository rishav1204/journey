import express from 'express';
import cors from 'cors';
import helmet from 'helmet';


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // Allow your frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));

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
