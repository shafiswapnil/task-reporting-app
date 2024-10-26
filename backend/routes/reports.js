// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();
const router = express.Router();

// GET /reports/:type - Generate reports
router.get('/:type', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, project } = req.query;

    if (!['daily', 'weekly', 'monthly'].includes(type)) {
      throw createHttpError(400, 'Invalid report type');
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

    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

export default router;
