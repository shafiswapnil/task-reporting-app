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
