// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('Authorization header is missing');
      return res.status(401).json({ msg: 'Authorization header is missing' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      console.log('Token is missing');
      return res.status(401).json({ msg: 'Token is missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Log the entire decoded token

    // Check for admin or developer and make sure ID is a number
    if (decoded.admin && typeof decoded.admin.id === 'number') {
      console.log('Admin authenticated:', decoded.admin);
      req.user = { id: decoded.admin.id }; // Set req.user to only contain the id, as an integer
    } else if (decoded.developer && typeof decoded.developer.id === 'number') {
      console.log('Developer authenticated:', decoded.developer);
      req.user = { id: decoded.developer.id }; // Set req.user to only contain the id, as an integer
    } else {
      console.log('Invalid token payload or ID type');
      return res.status(401).json({ msg: 'Invalid token payload or ID type' });
    }

    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token verification failed' });
  }
};

export default authMiddleware;
