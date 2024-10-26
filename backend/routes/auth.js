// Import required modules
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/auth/register-admin
router.post(
  '/register-admin',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password } = req.body;

    try {
      console.log('Trying to create admin:', req.body); // Debugging log

      // Check if admin already exists
      let admin = await prisma.admin.findUnique({ where: { email } });
      if (admin) {
        return res.status(400).json({ msg: 'Admin already exists' });
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new admin
      admin = await prisma.admin.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
        },
      });

      console.log('Admin created successfully:', admin); // Debugging log

      // Return JWT (optional)
      const payload = {
        admin: {
          id: admin.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error Details:', err.message); // Debugging log
      res.status(500).send('Server error');
    }
  }
);

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists (could be admin or developer)
    let user = await prisma.admin.findUnique({ where: { email } });
    let role = 'admin';
    
    if (!user) {
      user = await prisma.developer.findUnique({ where: { email } });
      role = 'developer';
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, email: user.email, role: role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// POST /api/auth/register-developer
router.post(
  '/register-developer',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phoneNumber, fullTime } = req.body;

    try {
      console.log('Trying to create developer:', req.body); // Debugging log

      // Check if developer already exists
      let developer = await prisma.developer.findUnique({ where: { email } });
      if (developer) {
        return res.status(400).json({ msg: 'Developer already exists' });
      }

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new developer
      developer = await prisma.developer.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phoneNumber,
          fullTime,
        },
      });

      console.log('Developer created successfully:', developer); // Debugging log

      // Return JWT (optional)
      const payload = {
        developer: {
          id: developer.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error Details:', err.message); // Debugging log
      res.status(500).send('Server error');
    }
  }
);

// POST /api/auth/developer-login
router.post(
  '/developer-login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      console.log('Trying to login developer:', email); // Debugging log

      // Check if developer exists
      let developer = await prisma.developer.findUnique({ where: { email } });
      if (!developer) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, developer.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      console.log('Developer logged in successfully:', developer); // Debugging log

      // Return JWT
      const payload = {
        developer: {
          id: developer.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Error Details:', err.message); // Debugging log
      res.status(500).send('Server error');
    }
  }
);

// Example of a protected route
router.get('/protected-data', authMiddleware, async (req, res) => {
  try {
    // Access the authenticated user's info from req.user
    console.log('Authenticated User:', req.user);

    res.json({ msg: 'You have access to this protected data.' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Server error');
  }
});

export default router;
