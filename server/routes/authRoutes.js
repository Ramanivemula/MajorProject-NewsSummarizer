const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

// POST /auth/register
router.post('/register', authController.register);

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/verify-otp
router.post('/verify-otp', authController.verifyOtp);

// GET /auth/me - Get current user profile
router.get('/me', authenticateToken, authController.getProfile);

// PUT /auth/profile - Update user profile
router.put('/profile', authenticateToken, authController.updateProfile);

// GET /auth/test-email - Test email configuration
router.get('/test-email', authController.testEmail);

module.exports = router;
