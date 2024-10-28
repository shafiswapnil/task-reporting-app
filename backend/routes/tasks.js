// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import Joi from 'joi';
import createHttpError from 'http-errors';
import { apiLimiter } from '../middleware/rateLimiter.js';

const prisma = new PrismaClient();
const router = express.Router();

// Define Joi schema for task validation
const taskSchema = Joi.object({
  date: Joi.date().iso().required(),
  project: Joi.string().required(),
  role: Joi.string().required(),
  team: Joi.string().valid('web', 'app').required(),
  targetsGiven: Joi.string().required(),
  targetsAchieved: Joi.string().required(),
  status: Joi.string().valid('Completed', 'Unfinished', 'Pending', 'Dependent', 'PartiallyCompleted').required(),
});

// POST / - Add a new task
router.post('/', apiLimiter, authMiddleware, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      throw createHttpError(400, error.details[0].message);
    }

    const { date, project, role, team, targetsGiven, targetsAchieved, status } = value;

    // Check if task already exists for this date and developer
    const existingTask = await prisma.task.findFirst({
      where: {
        developerId: req.user.id,
        date: new Date(date)
      }
    });

    if (existingTask) {
      throw createHttpError(409, 'Task already exists for this date');
    }

    const task = await prisma.task.create({
      data: {
        developerId: req.user.id,
        date: new Date(date),
        project,
        role,
        team,
        targetsGiven,
        targetsAchieved,
        status, // Removed 'as TaskStatus'
        submittedAt: new Date()
      },
      include: {
        developer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Task creation error:', error);
    if (error instanceof createHttpError.HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ 
        error: 'Failed to create task',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

// GET /user - Get tasks for the logged-in user
router.get('/user', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        developerId: req.user.id
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /submission-status - Get task submission status for date range
router.get('/submission-status', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Add input validation
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate and endDate' 
      });
    }

    // Validate date format
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate date range
    if (endDateTime < startDateTime) {
      return res.status(400).json({ 
        error: 'endDate must be after startDate' 
      });
    }

    const developerId = req.user.id;

    // Get developer first to verify existence
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { workingDays: true },
    });

    if (!developer) {
      return res.status(404).json({ 
        error: 'Developer not found' 
      });
    }

    // Get all submitted tasks for the date range
    const submittedTasks = await prisma.task.findMany({
      where: {
        developerId,
        date: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      select: {
        id: true,
        date: true,
        submittedAt: true,
      },
    });

    // Generate status for each working day in the range
    const status = [];
    const currentDate = new Date(startDateTime);

    while (currentDate <= endDateTime) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (developer.workingDays.includes(dayName)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const submittedTask = submittedTasks.find(
          task => task.date.toISOString().split('T')[0] === dateStr
        );

        status.push({
          date: dateStr,
          isSubmitted: !!submittedTask,
          taskId: submittedTask?.id || null,
          submittedAt: submittedTask?.submittedAt || null,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      startDate: startDate,
      endDate: endDate,
      workingDays: developer.workingDays,
      submissions: status
    });

  } catch (error) {
    console.error('Error getting submission status:', error);
    res.status(500).json({ 
      error: 'Failed to get submission status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
