import createHttpError from 'http-errors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.role) {
            throw createHttpError(401, 'Unauthorized: Invalid user credentials');
        }

        if (req.user.role !== 'admin') {
            throw createHttpError(403, 'Forbidden: Admin access required');
        }

        next();
    } catch (error) {
        next(error);
    }
};

export default adminMiddleware;
