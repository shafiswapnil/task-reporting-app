// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            throw createHttpError(401, 'No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        next();
    } catch (error) {
        next(createHttpError(401, 'Invalid or expired token'));
    }
};

export default authMiddleware;
