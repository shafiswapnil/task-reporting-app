// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const prisma = new PrismaClient();
const router = express.Router();

// GET /reports/:type - Generate reports
router.get('/:type', authMiddleware, async (req, res) => {
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
      filteredTasks = filteredTasks.filter((task) => task.date.toISOString().split('T')[0] === todayString);
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
    } else {
      return res.status(400).json({ msg: 'Invalid report type. Use daily, weekly, or monthly.' });
    }

    const doc = new jsPDF();
    doc.text(`Tasks Report - ${type}`, 20, 10);
    doc.autoTable({
      head: [['Developer', 'Date', 'Project', 'Role', 'Team', 'Targets Given', 'Targets Achieved', 'Status']],
      body: filteredTasks.map((task) => [
        task.developer.name,
        task.date.toISOString().split('T')[0],
        task.project,
        task.role,
        task.team,
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
