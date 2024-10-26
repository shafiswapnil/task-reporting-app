// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// POST / - Add a new task
router.post('/', authMiddleware, async (req, res) => {
  const { developerId, date, project, role, team, targetsGiven, targetsAchieved, status } = req.body;
  try {
    // Check if developer exists
    const developer = await prisma.developer.findUnique({ where: { id: developerId } });
    if (!developer) {
      return res.status(400).json({ msg: 'Developer not found' });
    }

    // Create new task
    const task = await prisma.task.create({
      data: { developerId, date, project, role, team, targetsGiven, targetsAchieved, status },
    });
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err.message);
    res.status(500).send('Server error');
  }
});

// GET / - Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        developer: true,
      },
    });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).send('Server error');
  }
});

// GET /:id - Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        developer: true,
      },
    });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task:', err.message);
    res.status(500).send('Server error');
  }
});

// PUT /:id - Update task
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { developerId, date, project, role, team, targetsGiven, targetsAchieved, status } = req.body;
  try {
    let task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { developerId, date, project, role, team, targetsGiven, targetsAchieved, status },
    });
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /:id - Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    await prisma.task.delete({ where: { id: parseInt(id) } });
    res.json({ msg: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
