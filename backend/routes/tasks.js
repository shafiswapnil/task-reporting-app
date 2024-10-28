import adminMiddleware from '../middleware/adminMiddleware.js'; // Import the admin middleware

// POST /api/tasks/admin - Create a new task manually
router.post('/admin', apiLimiter, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Validate request body
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
      throw createHttpError(404, 'Developer not found');
    }

    // Check if task already exists for this date and developer
    const existingTask = await prisma.task.findFirst({
      where: {
        developerId,
        date: new Date(date),
      },
    });

    if (existingTask) {
      throw createHttpError(409, 'Task already exists for this date and developer');
    }

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
      message: 'Task created successfully by admin',
      task,
    });
  } catch (error) {
    console.error('Admin Task creation error:', error);
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

// PUT /api/tasks/admin/:id - Update an existing task
router.put('/admin/:id', apiLimiter, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      throw createHttpError(400, 'Invalid Task ID');
    }

    // Validate request body
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      throw createHttpError(400, error.details[0].message);
    }

    const { developerId, date, project, role, team, targetsGiven, targetsAchieved, status } = value;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw createHttpError(404, 'Task not found');
    }

    // If developerId is being updated, ensure the new developer exists
    if (developerId && developerId !== existingTask.developerId) {
      const developer = await prisma.developer.findUnique({
        where: { id: developerId },
      });

      if (!developer) {
        throw createHttpError(404, 'New Developer not found');
      }
    }

    // Check for duplicate task on update
    const duplicateTask = await prisma.task.findFirst({
      where: {
        developerId: developerId || existingTask.developerId,
        date: new Date(date),
        NOT: { id: taskId },
      },
    });

    if (duplicateTask) {
      throw createHttpError(409, 'Another task already exists for this date and developer');
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        developerId: developerId || existingTask.developerId,
        date: new Date(date),
        project,
        role,
        team,
        targetsGiven,
        targetsAchieved,
        status,
        // Update submittedAt only if the status is not Pending
        submittedAt: status !== 'Pending' ? new Date() : existingTask.submittedAt,
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
      message: 'Task updated successfully by admin',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Admin Task update error:', error);
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

// DELETE /api/tasks/admin/:id - Delete a task
router.delete('/admin/:id', apiLimiter, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      throw createHttpError(400, 'Invalid Task ID');
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw createHttpError(404, 'Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({
      message: 'Task deleted successfully by admin',
    });
  } catch (error) {
    console.error('Admin Task deletion error:', error);
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

// GET /api/tasks/admin - Get all tasks (admin only)
router.get('/admin', apiLimiter, authMiddleware, adminMiddleware, async (req, res) => {
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
        date: 'desc',
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Admin Get Tasks error:', error);
    res.status(500).json({
      error: 'Failed to fetch tasks',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Existing Routes ...

// GET /user - Get tasks for the logged-in user
router.get('/user', authMiddleware, async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        developerId: req.user.id
      },
      orderBy: {
        date: 'desc'
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
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /submission-status - Get task submission status for date range
router.get('/submission-status', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Add input validation
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate and endDate' 
      });
    }

    // Validate date format
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }

    // Validate date range
    if (endDateTime < startDateTime) {
      return res.status(400).json({ 
        error: 'endDate must be after startDate' 
      });
    }

    const developerId = req.user.id;

    // Get developer first to verify existence
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      select: { workingDays: true },
    });

    if (!developer) {
      return res.status(404).json({ 
        error: 'Developer not found' 
      });
    }

    // Get all submitted tasks for the date range
    const submittedTasks = await prisma.task.findMany({
      where: {
        developerId,
        date: {
          gte: startDateTime,
          lte: endDateTime,
        },
      },
      select: {
        id: true,
        date: true,
        submittedAt: true,
      },
    });

    // Generate status for each working day in the range
    const status = [];
    const currentDate = new Date(startDateTime);

    while (currentDate <= endDateTime) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      if (developer.workingDays.includes(dayName)) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const submittedTask = submittedTasks.find(
          task => task.date.toISOString().split('T')[0] === dateStr
        );

        status.push({
          date: dateStr,
          isSubmitted: !!submittedTask,
          taskId: submittedTask?.id || null,
          submittedAt: submittedTask?.submittedAt || null,
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      startDate: startDate,
      endDate: endDate,
      workingDays: developer.workingDays,
      submissions: status
    });

  } catch (error) {
    console.error('Error getting submission status:', error);
    res.status(500).json({ 
      error: 'Failed to get submission status',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
