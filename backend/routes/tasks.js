import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import Joi from 'joi';
import createHttpError from 'http-errors';
import { apiLimiter } from '../middleware/rateLimiter.js';

const prisma = new PrismaClient();
const router = express.Router();

// Validation schemas
const developerTaskSchema = Joi.object({
    date: Joi.date().iso().required(),
    targetsGiven: Joi.string().required(),
    targetsAchieved: Joi.string().required(),
    status: Joi.string().valid('Completed', 'Unfinished', 'Pending', 'Dependent', 'PartiallyCompleted').required(),
});

const adminTaskSchema = Joi.object({
    developerId: Joi.number().integer().positive().required(),
    date: Joi.date().iso().required(),
    project: Joi.string().required(),
    role: Joi.string().required(),
    team: Joi.string().valid('web', 'app').required(),
    targetsGiven: Joi.string().required(),
    targetsAchieved: Joi.string().required(),
    status: Joi.string().valid('Completed', 'Unfinished', 'Pending', 'Dependent', 'PartiallyCompleted').required(),
});

// -------------------
// Developer Routes
// -------------------

// Submit a new task (Developer)
router.post('/', apiLimiter, authMiddleware, async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = developerTaskSchema.validate(req.body);
        if (error) {
            throw createHttpError(400, error.details[0].message);
        }

        const { date, targetsGiven, targetsAchieved, status } = value;

        // Fetch developer's details to get project, role, and team
        const developer = await prisma.developer.findUnique({
            where: { id: req.user.id },
            select: {
                projects: true,
                role: true,
                team: true,
            },
        });

        if (!developer) {
            throw createHttpError(404, 'Developer not found');
        }

        // Assign project (selecting the first project for simplicity)
        const project = developer.projects.length > 0 ? developer.projects[0] : 'Unknown Project';
        const role = developer.role;
        const team = developer.team;

        // Create the task
        const task = await prisma.task.create({
            data: {
                developerId: req.user.id,
                date: new Date(date),
                project,
                role,
                team,
                targetsGiven,
                targetsAchieved,
                status,
                submittedAt: new Date(),
            },
        });

        res.status(201).json({
            message: 'Task submitted successfully',
            task,
        });
    } catch (error) {
        console.error('Developer Task Submission Error:', error);
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: 'Failed to submit task',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
});

// Fetch submitted tasks (Developer)
router.get('/submitted', apiLimiter, authMiddleware, async (req, res, next) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                developerId: req.user.id,
            },
            orderBy: { date: 'desc' },
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Fetch Submitted Tasks Error:', error);
        res.status(500).json({
            error: 'Failed to fetch submitted tasks',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// -------------------
// Admin Routes
// -------------------

// Create a new task (Admin)
router.post('/admin', apiLimiter, authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = adminTaskSchema.validate(req.body);
        if (error) {
            throw createHttpError(400, error.details[0].message);
        }

        const { developerId, date, project, role, team, targetsGiven, targetsAchieved, status } = value;

        // Check if developer exists
        const developer = await prisma.developer.findUnique({
            where: { id: developerId },
        });

        if (!developer) {
            throw createHttpError(404, 'Developer not found');
        }

        // Create the task
        const task = await prisma.task.create({
            data: {
                developerId,
                date: new Date(date),
                project,
                role,
                team,
                targetsGiven,
                targetsAchieved,
                status,
                submittedAt: new Date(),
            },
            include: {
                developer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json({
            message: 'Task created successfully',
            task,
        });
    } catch (error) {
        console.error('Admin Task Creation Error:', error);
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: 'Failed to create task',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
});

// Fetch all tasks (Admin)
router.get('/admin', apiLimiter, authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                developer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Fetch All Tasks Error:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});

// Update a task (Admin)
router.put('/admin/:id', apiLimiter, authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            throw createHttpError(400, 'Invalid task ID');
        }

        // Validate request body
        const { error, value } = adminTaskSchema.validate(req.body);
        if (error) {
            throw createHttpError(400, error.details[0].message);
        }

        const { developerId, date, project, role, team, targetsGiven, targetsAchieved, status } = value;

        // Check if task exists
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!existingTask) {
            throw createHttpError(404, `Task with ID ${taskId} not found`);
        }

        // Check if developer exists
        const developer = await prisma.developer.findUnique({
            where: { id: developerId },
        });

        if (!developer) {
            throw createHttpError(404, 'Developer not found');
        }

        // Update the task
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                developerId,
                date: new Date(date),
                project,
                role,
                team,
                targetsGiven,
                targetsAchieved,
                status,
            },
            include: {
                developer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });

        res.status(200).json({
            message: 'Task updated successfully',
            task: updatedTask,
        });
    } catch (error) {
        console.error('Admin Task Update Error:', error);
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: 'Failed to update task',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
});

// Delete a task (Admin)
router.delete('/admin/:id', apiLimiter, authMiddleware, adminMiddleware, async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            throw createHttpError(400, 'Invalid task ID');
        }

        // Check if task exists
        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!existingTask) {
            throw createHttpError(404, `Task with ID ${taskId} not found`);
        }

        // Delete task
        await prisma.task.delete({
            where: { id: taskId },
        });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Admin Task Deletion Error:', error);
        if (error instanceof createHttpError.HttpError) {
            res.status(error.statusCode).json({ error: error.message });
        } else {
            res.status(500).json({
                error: 'Failed to delete task',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
});

// Add this route to handle submission status
router.get('/submission-status', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const tasks = await prisma.task.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
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

    res.json(tasks);
  } catch (error) {
    console.error('Submission Status Error:', error);
    res.status(500).json({
      error: 'Failed to fetch submission status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add this route after line 95
router.get('/', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const { developerEmail } = req.query;
    const whereClause = {};

    if (developerEmail) {
      whereClause.developer = {
        email: developerEmail
      };
    } else {
      whereClause.developerId = req.user.id;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        developer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Fetch Tasks Error:', error);
    next(error);
  }
});

export default router;
