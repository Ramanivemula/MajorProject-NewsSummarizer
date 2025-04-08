const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1]; // Get only the token part after "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Set decoded payload (user info) to request
    next();
  } catch (err) {
    console.error('Token error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

module.exports = authenticate;
