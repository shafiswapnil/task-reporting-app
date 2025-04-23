// Import required modules
import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import Joi from 'joi';
import createHttpError from 'http-errors';
import { apiLimiter } from '../middleware/rateLimiter.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Developer:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phoneNumber
 *         - fullTime
 *         - team
 *         - projects
 *         - workingDays
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Developer's full name
 *         email:
 *           type: string
 *           format: email
 *           description: Developer's email address
 *         phoneNumber:
 *           type: string
 *           description: Developer's phone number
 *         fullTime:
 *           type: boolean
 *           description: Whether the developer is full-time
 *         team:
 *           type: string
 *           enum: [web, app]
 *           description: Developer's team
 *         projects:
 *           type: array
 *           items:
 *             type: string
 *           description: List of projects assigned to developer
 *         workingDays:
 *           type: array
 *           items:
 *             type: string
 *           description: List of working days
 *         role:
 *           type: string
 *           default: developer
 *           description: User role
 */

const developerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string(),
  fullTime: Joi.boolean().required(),
  team: Joi.string().valid('web', 'app').required(),
  projects: Joi.array().items(Joi.string()).required(),
  workingDays: Joi.array().items(Joi.string()).required(),
  password: Joi.string().min(6).required()
});

/**
 * @swagger
 * /api/developers:
 *   get:
 *     summary: Get all developers
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all developers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Developer'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new developer
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phoneNumber
 *               - fullTime
 *               - team
 *               - projects
 *               - workingDays
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phoneNumber:
 *                 type: string
 *               fullTime:
 *                 type: boolean
 *               team:
 *                 type: string
 *                 enum: [web, app]
 *               projects:
 *                 type: array
 *                 items:
 *                   type: string
 *               workingDays:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Developer created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Developer already exists
 */

// POST / - Add a new developer
router.post('/', apiLimiter, authMiddleware, async (req, res, next) => {
  try {
    const { error } = developerSchema.validate(req.body);
    if (error) {
      throw createHttpError(400, error.details[0].message);
    }

    const { name, email, phoneNumber, fullTime, team, projects, workingDays, password } = req.body;

    const existingDeveloper = await prisma.developer.findUnique({ where: { email } });
    if (existingDeveloper) {
      throw createHttpError(409, 'Developer already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const developer = await prisma.developer.create({
      data: { name, email, phoneNumber, fullTime, team, projects, workingDays, password: hashedPassword },
    });

    res.status(201).json(developer);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/developers/{id}:
 *   get:
 *     summary: Get developer by ID
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Developer ID
 *     responses:
 *       200:
 *         description: Developer details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Developer'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Developer not found
 *   put:
 *     summary: Update developer
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Developer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               fullTime:
 *                 type: boolean
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Developer updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Developer not found
 *   delete:
 *     summary: Delete developer
 *     tags: [Developers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Developer ID
 *     responses:
 *       200:
 *         description: Developer deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Developer not found
 */

// GET / - Get all developers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const developers = await prisma.developer.findMany();
    res.json(developers);
  } catch (err) {
    console.error('Error fetching developers:', err.message);
    res.status(500).send('Server error');
  }
});

// GET /:id - Get developer by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const developer = await prisma.developer.findUnique({ where: { id: parseInt(id) } });
    if (!developer) {
      return res.status(404).json({ msg: 'Developer not found' });
    }
    res.json(developer);
  } catch (err) {
    console.error('Error fetching developer:', err.message);
    res.status(500).send('Server error');
  }
});

// PUT /:id - Update developer
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, fullTime, password } = req.body;
  try {
    let developer = await prisma.developer.findUnique({ where: { id: parseInt(id) } });
    if (!developer) {
      return res.status(404).json({ msg: 'Developer not found' });
    }

    // Encrypt password if provided
    let hashedPassword = developer.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    developer = await prisma.developer.update({
      where: { id: parseInt(id) },
      data: { name, email, phoneNumber, fullTime, password: hashedPassword },
    });
    res.json(developer);
  } catch (err) {
    console.error('Error updating developer:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /:id - Delete developer
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const developer = await prisma.developer.findUnique({ where: { id: parseInt(id) } });
    if (!developer) {
      return res.status(404).json({ msg: 'Developer not found' });
    }
    await prisma.developer.delete({ where: { id: parseInt(id) } });
    res.json({ msg: 'Developer deleted successfully' });
  } catch (err) {
    console.error('Error deleting developer:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
