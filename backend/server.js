// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import developerRoutes from './routes/developers.js';
import taskRoutes from './routes/tasks.js';
import reportRoutes from './routes/reports.js';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Update this to your frontend URL
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
// app.use('/api/admin', adminRoutes);

// Health Check Route
app.get('/', (req, res) => {
    res.send('Welcome to the Task Reporting API');
});

// 404 Handler
app.use((req, res, next) => {
    next(createHttpError(404, 'Route not found'));
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add this near the top of your server.js file, after the imports
process.env.TZ = 'Asia/Dhaka';
