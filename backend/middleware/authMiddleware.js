// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Unauthorized: No token provided'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user information to the request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role, // Ensure the role is included in the JWT payload
    };
    next();
  } catch (error) {
    return next(createHttpError(401, 'Unauthorized: Invalid token'));
  }
};

export default authMiddleware;
