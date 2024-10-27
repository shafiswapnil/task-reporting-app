// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const prisma = new PrismaClient();
const router = express.Router();

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

// POST / - Add a new task
router.post('/', authMiddleware, async (req, res) => {
  const { developerId, project, targetsGiven, targetsAchieved, status, date } = req.body;
  try {
    const newTask = await prisma.task.create({
      data: {
        developerId,
        project,
        targetsGiven,
        targetsAchieved,
        status,
        date: new Date(date),
      },
    });
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task' });
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
    console.error('Error fetching tasks:', err);
    if (err.name === 'PrismaClientKnownRequestError') {
      res.status(400).json({ error: 'Invalid query' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
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
  const { developerId, date, project, targetsGiven, targetsAchieved, status } = req.body;
  try {
    let task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    if (task.developerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update this task' });
    }
    task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { developerId, date, project, targetsGiven, targetsAchieved, status },
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

// GET /reports/:type - Generate reports
router.get('/reports/:type', authMiddleware, async (req, res) => {
  const { type } = req.params;
  try {
    let filteredTasks = await prisma.task.findMany({
      include: {
        developer: true,
      },
    });

    const today = new Date();
    if (type === 'daily') {
      const todayString = today.toISOString().split('T')[0];
      filteredTasks = filteredTasks.filter((task) => task.date === todayString);
    } else if (type === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      filteredTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate >= weekAgo && taskDate <= today;
      });
    } else if (type === 'monthly') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      filteredTasks = filteredTasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate >= monthAgo && taskDate <= today;
      });
    }

    const doc = new jsPDF();
    doc.text(`Tasks Report - ${type}`, 20, 10);
    doc.autoTable({
      head: [['Developer', 'Date', 'Project', 'Targets Given', 'Targets Achieved', 'Status']],
      body: filteredTasks.map((task) => [
        task.developer.name,
        task.date,
        task.project,
        task.targetsGiven,
        task.targetsAchieved,
        task.status,
      ]),
    });
    const pdfData = doc.output();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('Error generating report:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
