// Import required modules
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import authMiddleware from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// POST /admins - Add a new admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ msg: 'Admin already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    res.status(201).json({ msg: 'Admin created successfully', admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /admins - Get all admins
router.get('/', authMiddleware, async (req, res) => {
  try {
    const admins = await prisma.admin.findMany();
    res.json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err.message);
    res.status(500).send('Server error');
  }
});

// GET /admins/:id - Get admin by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    console.error('Error fetching admin:', err.message);
    res.status(500).send('Server error');
  }
});

// PUT /admins/:id - Update admin
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    const updateData = {
      name,
      email,
      phone
    };

    // Only hash and update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const admin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(admin);
  } catch (err) {
    next(err);
  }
});

// DELETE /admins/:id - Delete admin
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    await prisma.admin.delete({ where: { id: parseInt(id) } });
    res.json({ msg: 'Admin deleted successfully' });
  } catch (err) {
    console.error('Error deleting admin:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
