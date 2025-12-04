const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const newsController = require('../controllers/newsController');

// Public routes
router.get('/latest', newsController.getLatestNews);
router.get('/search', newsController.searchNews);

// Protected routes (require authentication)
router.get('/personalized', authenticateToken, newsController.getPersonalizedNews);
router.post('/save', authenticateToken, newsController.saveArticle);
router.get('/saved', authenticateToken, newsController.getSavedArticles);
router.delete('/saved/:articleId', authenticateToken, newsController.removeSavedArticle);
router.post('/summarize', authenticateToken, newsController.summarizeArticle);
router.post('/read/:articleId', authenticateToken, newsController.markAsRead);
// Trigger a single personalized digest (protected). Body may include { userId } for admins; otherwise sends for current user.
router.post('/send-digest', authenticateToken, newsController.sendDigest);

module.exports = router;
