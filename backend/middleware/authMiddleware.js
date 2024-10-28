// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            throw createHttpError(401, 'No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get developer details from database
        const developer = await prisma.developer.findUnique({
            where: { id: decoded.developer.id },
            select: { id: true, email: true, role: true }
        });

        if (!developer) {
            throw createHttpError(401, 'Developer not found');
        }

        req.user = {
            id: developer.id,
            email: developer.email,
            role: developer.role
        };
        
        next();
    } catch (error) {
        next(createHttpError(401, 'Invalid or expired token'));
    }
};

export default authMiddleware;
