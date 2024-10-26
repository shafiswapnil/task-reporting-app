// Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
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

// Home route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the Task Reporting API');
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
