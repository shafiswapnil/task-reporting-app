// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createHttpError(401, 'Authorization header missing or malformed'));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token to req.user
        next();
    } catch (error) {
        console.error('Authentication Error:', error);
        return next(createHttpError(401, 'Invalid or expired token'));
    }
};

export default authMiddleware;
