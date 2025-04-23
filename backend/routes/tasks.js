import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import Joi from 'joi';
import createHttpError from 'http-errors';
import { apiLimiter } from '../middleware/rateLimiter.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - date
 *         - project
 *         - targetsGiven
 *         - targetsAchieved
 *         - status
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the task
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the task
 *         project:
 *           type: string
 *           description: Project name
 *         targetsGiven:
 *           type: string
 *           description: Targets assigned for the task
 *         targetsAchieved:
 *           type: string
 *           description: Targets completed for the task
 *         status:
 *           type: string
 *           enum: [Completed, Unfinished, Pending, Dependent, PartiallyCompleted]
 *           description: Current status of the task
 *         developerId:
 *           type: integer
 *           description: ID of the developer assigned to the task
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the task was submitted
 */

// Validation schemas
const developerTaskSchema = Joi.object({
    date: Joi.string().required(),
    project: Joi.string().required(),
    targetsGiven: Joi.string().required(),
    targetsAchieved: Joi.string().required(),
    status: Joi.string()
        .valid(
            'Completed',
            'Unfinished',
            'Pending',
            'Dependent',
            'PartiallyCompleted'
        )
        .required(),
    developerEmail: Joi.string().email().required() // Add this line
}).unknown(true);

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

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Submit a new task (Developer)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - project
 *               - targetsGiven
 *               - targetsAchieved
 *               - status
 *               - developerEmail
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               project:
 *                 type: string
 *               targetsGiven:
 *                 type: string
 *               targetsAchieved:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Completed, Unfinished, Pending, Dependent, PartiallyCompleted]
 *               developerEmail:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Developer not found
 */
router.post('/', apiLimiter, authMiddleware, async (req, res, next) => {
    try {
        const { date, project, targetsGiven, targetsAchieved, status, developerEmail } = req.body;

        // Find developer by email
        const developer = await prisma.developer.findUnique({
            where: { email: developerEmail }
        });

        if (!developer) {
            return res.status(404).json({ error: 'Developer not found' });
        }

        const task = await prisma.task.create({
            data: {
                date: new Date(date),
                project,
                targetsGiven,
                targetsAchieved,
                status,
                developerId: developer.id,
                role: developer.role,
                team: developer.team
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Task creation error:', error);
        next(error);
    }
});

/**
 * @swagger
 * /api/tasks/submitted:
 *   get:
 *     summary: Get all submitted tasks for the logged-in developer
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/tasks/admin:
 *   get:
 *     summary: Get all tasks (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *   post:
 *     summary: Create a new task (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - developerId
 *               - date
 *               - project
 *               - role
 *               - team
 *               - targetsGiven
 *               - targetsAchieved
 *               - status
 *             properties:
 *               developerId:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               project:
 *                 type: string
 *               role:
 *                 type: string
 *               team:
 *                 type: string
 *                 enum: [web, app]
 *               targetsGiven:
 *                 type: string
 *               targetsAchieved:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Completed, Unfinished, Pending, Dependent, PartiallyCompleted]
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
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

// Get all tasks for a developer
router.get('/', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        developer: {
          email: req.user.email
        }
      },
      include: {
        developer: {
          select: {
            name: true,
            email: true,
            role: true,
            team: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Add this route for developer task updates
// Update task (Developer)
router.put('/:id', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      throw createHttpError(400, 'Invalid task ID');
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { developer: true }
    });

    if (!existingTask) {
      throw createHttpError(404, 'Task not found');
    }

    const normalizedTaskEmail = existingTask.developer.email.toLowerCase().trim();
    const normalizedUserEmail = req.user.email.toLowerCase().trim();

    if (normalizedTaskEmail !== normalizedUserEmail) {
      throw createHttpError(403, 'Unauthorized: Cannot update task that belongs to another developer');
    }

    const { date, project, targetsGiven, targetsAchieved, status } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        date: new Date(date),
        project,
        targetsGiven,
        targetsAchieved,
        status
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

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/developer
router.get('/developer', authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                developer: {
                    email: req.user.email
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching developer tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/tasks/developer
router.post('/developer', authMiddleware, async (req, res) => {
    try {
        const { error, value } = developerTaskSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const developer = await prisma.developer.findUnique({
            where: { email: value.developerEmail }
        });

        if (!developer) {
            return res.status(404).json({ error: 'Developer not found' });
        }

        const task = await prisma.task.create({
            data: {
                date: new Date(value.date),
                project: value.project,
                targetsGiven: value.targetsGiven,
                targetsAchieved: value.targetsAchieved,
                status: value.status,
                developerId: developer.id,
                submittedAt: new Date()
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// GET /tasks/submitted - Get tasks for logged-in developer
router.get('/submitted', authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            where: {
                developerId: req.user.id // Make sure this matches your auth middleware
            },
            orderBy: {
                date: 'desc'
            }
        });
        
        console.log('Found tasks:', tasks); // Add this for debugging
        res.json(tasks);
    } catch (error) {
        console.error('Error in /tasks/submitted:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tasks',
            details: error.message 
        });
    }
});

router.put('/api/tasks/:id', apiLimiter, authMiddleware, async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            throw createHttpError(400, 'Invalid task ID');
        }

        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: { developer: true }
        });

        if (!existingTask) {
            throw createHttpError(404, 'Task not found');
        }

        // Validate user permission
        const normalizedTaskEmail = existingTask.developer.email.toLowerCase().trim();
        const normalizedUserEmail = req.user.email.toLowerCase().trim();

        if (normalizedTaskEmail !== normalizedUserEmail) {
            throw createHttpError(403, 'Unauthorized: Cannot update task that belongs to another developer');
        }

        const { date, project, targetsGiven, targetsAchieved, status } = req.body;

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                date: new Date(date),
                project,
                targetsGiven,
                targetsAchieved,
                status
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

        res.json({
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', apiLimiter, authMiddleware, async (req, res, next) => {
    try {
        const taskId = parseInt(req.params.id, 10);
        if (isNaN(taskId)) {
            throw createHttpError(400, 'Invalid task ID');
        }

        const existingTask = await prisma.task.findUnique({
            where: { id: taskId },
            include: { developer: true }
        });

        if (!existingTask) {
            throw createHttpError(404, 'Task not found');
        }

        // Validate user permission
        const normalizedTaskEmail = existingTask.developer.email.toLowerCase().trim();
        const normalizedUserEmail = req.user.email.toLowerCase().trim();

        if (normalizedTaskEmail !== normalizedUserEmail) {
            throw createHttpError(403, 'Unauthorized: Cannot delete task that belongs to another developer');
        }

        await prisma.task.delete({
            where: { id: taskId }
        });

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
