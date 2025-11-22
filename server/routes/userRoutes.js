const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const preferenceController = require('../controllers/preferenceController');

// Profile routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);

// Preference routes
router.get('/preferences', authenticateToken, preferenceController.getPreferences);
router.put('/preferences', authenticateToken, preferenceController.updatePreferences);

// Notification settings
router.put('/preferences/notifications', authenticateToken, preferenceController.updateNotificationSettings);

// Keywords management
router.post('/preferences/keywords/include', authenticateToken, preferenceController.addIncludeKeyword);
router.post('/preferences/keywords/exclude', authenticateToken, preferenceController.addExcludeKeyword);
router.delete('/preferences/keywords/include/:keyword', authenticateToken, preferenceController.removeIncludeKeyword);
router.delete('/preferences/keywords/exclude/:keyword', authenticateToken, preferenceController.removeExcludeKeyword);

// Blocked sources
router.post('/preferences/blocked-sources', authenticateToken, preferenceController.blockSource);
router.delete('/preferences/blocked-sources/:source', authenticateToken, preferenceController.unblockSource);

// Reading history
router.get('/reading-history', authenticateToken, preferenceController.getReadingHistory);

module.exports = router;
