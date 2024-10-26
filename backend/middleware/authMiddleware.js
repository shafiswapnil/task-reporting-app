// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('Authorization header is missing');
      return res.status(401).json({ msg: 'Authorization denied. No authorization header.' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      console.log('Token is missing');
      return res.status(401).json({ msg: 'Authorization denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check for admin or developer and make sure ID is a number
    if (decoded.id && typeof decoded.id === 'number') {
      req.user = { id: decoded.id }; // Set req.user to contain the id as an integer
    } else {
      console.log('Invalid token payload or ID type');
      return res.status(401).json({ msg: 'Authorization denied. Invalid token.' });
    }

    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Authorization denied. Token is not valid.' });
  }
};

export default authMiddleware;
