// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();
const router = express.Router();

// GET /reports - Generate reports
router.get('/', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const { type, startDate, endDate, project } = req.query;

    // Check if the user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    if (!type || !['daily', 'weekly', 'monthly'].includes(type)) {
      throw createHttpError(400, 'Invalid or missing report type');
    }

    let tasks;
    const whereClause = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (project) {
      whereClause.project = project;
    }

    tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        developer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Format the data to match the frontend expectations
    const formattedTasks = tasks.map(task => ({
      date: task.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      developer: { name: task.developer.name },
      project: task.project,
      targetsGiven: task.targetsGiven,
      targetsAchieved: task.targetsAchieved,
      status: task.status,
    }));

    res.json(formattedTasks);
  } catch (error) {
    next(error);
  }
});

export default router;
