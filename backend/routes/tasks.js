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

// Create task route
router.post('/admin', apiLimiter, authMiddleware, adminMiddleware, async (req, res) => {
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
        status: status, // Removed TypeScript casting
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

export default router;
