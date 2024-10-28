import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import Joi from 'joi';
import createHttpError from 'http-errors';
import { apiLimiter } from '../middleware/rateLimiter.js';

const prisma = new PrismaClient();
const router = express.Router();

// Validation schema
const taskSchema = Joi.object({
  developerId: Joi.number().integer().positive().required(),
  date: Joi.date().iso().required(),
  project: Joi.string().required(),
  role: Joi.string().required(),
  team: Joi.string().valid('web', 'app').required(),
  targetsGiven: Joi.string().required(),
  targetsAchieved: Joi.string().required(),
  status: Joi.string().valid('Completed', 'Unfinished', 'Pending', 'Dependent', 'PartiallyCompleted').required(),
});

// Create task route (Admin)
router.post('/admin', apiLimiter, authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      throw createHttpError(400, error.details[0].message);
    }

    const { developerId, date, project, role, team, targetsGiven, targetsAchieved, status } = value;

    // Check if developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
    });

    if (!developer) {
      throw createHttpError(404, `Developer with ID ${developerId} not found`);
    }

    // Create task
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
    console.error('Task creation error:', error);
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

// GET all tasks (admin only)
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
      orderBy: {
        date: 'asc',
      },
    });

    // Format tasks as needed
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      date: task.date.toISOString().split('T')[0],
      developerName: task.developer.name,
      developerEmail: task.developer.email,
      project: task.project,
      role: task.role,
      team: task.team,
      targetsGiven: task.targetsGiven,
      targetsAchieved: task.targetsAchieved,
      status: task.status,
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching admin tasks:', error);
    next(error);
  }
});

// Update task route (Admin)
router.put('/admin/:id', apiLimiter, authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      throw createHttpError(400, 'Invalid task ID');
    }

    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      throw createHttpError(400, error.details[0].message);
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw createHttpError(404, `Task with ID ${taskId} not found`);
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: value,
      include: {
        developer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Task update error:', error);
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

// Delete task route (Admin)
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

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task deletion error:', error);
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

export default router;
