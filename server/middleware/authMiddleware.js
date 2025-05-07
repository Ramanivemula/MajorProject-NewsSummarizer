const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware 1: For routes using async/await style
const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // payload like { id: userId }
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// ✅ Middleware 2: For routes using callback-style
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token is not valid' });

    req.user = user;
    next();
  });
};

// ✅ Export both
module.exports = {
  authenticate,
  authenticateToken
};
