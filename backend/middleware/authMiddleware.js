// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    
    // Log token for debugging
    console.log('Received token:', token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug log

      // Find user based on isAdmin flag
      let user;
      if (decoded.isAdmin) {
        user = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            role: true,
            name: true
          }
        });
      } else {
        user = await prisma.developer.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
            team: true
          }
        });
      }

      if (!user) {
        throw createHttpError(401, 'User not found');
      }

      // Attach user info to request
      req.user = {
        ...user,
        isAdmin: decoded.isAdmin
      };

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      throw createHttpError(401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
