// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import developerRoutes from './routes/developers.js';
import taskRoutes from './routes/tasks.js';
import adminRoutes from './routes/admin.js';
import reportRoutes from './routes/reports.js';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/reports', reportRoutes);

// Home route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Task Reporting API');
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
