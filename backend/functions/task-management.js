import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req, res) => {
  if (req.method === 'GET') {
    try {
      const tasks = await prisma.task.findMany();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    const { developerId, project, target, status, date } = req.body;
    try {
      const newTask = await prisma.task.create({
        data: {
          developerId,
          project,
          target,
          status,
          date: new Date(date),
        },
      });
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create task' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};