// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the report
 *         developer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         project:
 *           type: string
 *         targetsGiven:
 *           type: string
 *         targetsAchieved:
 *           type: string
 *         status:
 *           type: string
 *           enum: [Completed, Unfinished, Pending, Dependent, PartiallyCompleted]
 */

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Generate reports (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: Type of report to generate
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report range
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report range
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter by project name
 *     responses:
 *       200:
 *         description: Report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */

/**
 * @swagger
 * /api/reports/missing:
 *   get:
 *     summary: Get missing reports for a developer
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Developer's email
 *     responses:
 *       200:
 *         description: List of dates with missing reports
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 format: date
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Developer not found
 */

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

// GET /missing - Get missing reports for a developer
router.get('/missing', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const { email } = req.query;
    console.log('Checking missing reports for email:', email);

    const developer = await prisma.developer.findUnique({
      where: { email: email.toString() },
      select: {
        id: true,
        workingDays: true,
        fullTime: true
      }
    });

    if (!developer) {
      throw createHttpError(404, 'Developer not found');
    }

    // Force working days to include weekdays
    developer.workingDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    console.log('Developer working days:', developer.workingDays);

    // Get current month's start and end dates
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    console.log('Checking dates from', startOfMonth, 'to', endOfMonth);

    const submittedTasks = await prisma.task.findMany({
      where: {
        developerId: developer.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        date: true
      }
    });

    console.log('Found submitted tasks:', submittedTasks);

    // Convert submitted dates to a Set for faster lookup
    const submittedDates = new Set(
      submittedTasks.map(task => task.date.toISOString().split('T')[0])
    );

    console.log('Submitted dates:', Array.from(submittedDates));

    // Generate array of working days in the current month
    const missingDates = [];
    const checkDate = new Date(startOfMonth);

    while (checkDate <= endOfMonth) {
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Skip weekends and check if task was submitted
      if (developer.workingDays.includes(dayName) && !submittedDates.has(dateStr)) {
        console.log(`Found missing date: ${dateStr} (${dayName})`);
        missingDates.push({
          date: dateStr,
          reason: 'No task submitted for working day'
        });
      }
      
      checkDate.setDate(checkDate.getDate() + 1);
    }

    console.log('Final missing dates:', missingDates);

    res.json({
      email: email,
      missingDates: missingDates
    });

  } catch (error) {
    console.error('Error in missing reports:', error);
    next(error);
  }
});

export default router;

