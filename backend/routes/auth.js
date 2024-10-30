// Import required modules
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import authMiddleware from '../middleware/authMiddleware.js';
import createHttpError from 'http-errors';

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

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for:', email); // Debug log

        // First try to find admin
        let user = await prisma.admin.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                role: true
            }
        });

        let isAdmin = true;

        // If not found as admin, try developer
        if (!user) {
            isAdmin = false;
            user = await prisma.developer.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    name: true,
                    role: true,
                }
            });
        }

        // Check if user exists
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log('User logged in successfully:', user); // Debugging log

        // Return JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role,
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
          res.json({
            token,
            id: developer.id,
            email: developer.email,
            role: developer.role,
            name: developer.name
          });
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

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password,
            phoneNumber,
            fullTime,
            team,
            projects,
            workingDays 
        } = req.body;

        // Check if developer already exists
        const existingDeveloper = await prisma.developer.findUnique({
            where: { email }
        });

        if (existingDeveloper) {
            throw createHttpError(409, 'Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new developer
        const developer = await prisma.developer.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                fullTime,
                team,
                projects,
                workingDays,
                role: 'developer' // Default role
            }
        });

        // Generate token
        const token = jwt.sign(
            { 
                id: developer.id, 
                email: developer.email,
                role: 'developer'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return response without password
        const { password: _, ...developerWithoutPassword } = developer;
        res.status(201).json({
            message: 'Developer registered successfully',
            token,
            developer: developerWithoutPassword
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(error.status || 500).json({
            error: error.message || 'Failed to register developer'
        });
    }
});

export default router;
