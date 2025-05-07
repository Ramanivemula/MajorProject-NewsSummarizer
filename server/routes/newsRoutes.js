const express = require('express');
const axios = require('axios');
const { authenticate } = require('../middleware/authMiddleware');
const { fetchNewsFromDB } = require('../controllers/newsController');
const News = require('../models/News');

const router = express.Router();

// 🔹 Dummy summarizer for /latest route
const dummySummarize = (content) => {
  const points = content.split('.').slice(0, 6);
  return points.map(p => p.trim()).filter(p => p.length > 2);
};

// 🔹 GET /api/news/latest - Landing page summarized news
router.get('/latest', async (req, res) => {
  try {
    const response = await axios.get(
      `https://gnews.io/api/v4/top-headlines?lang=en&country=in&token=${process.env.GNEWS_API_KEY}`
    );
    const articles = response.data.articles.slice(0, 6);

    const summarizedNews = articles.map(article => ({
      title: article.title,
      summary: dummySummarize(article.content || article.description || ''),
      url: article.url,
      image: article.image,
      source: article.source?.name || 'Unknown',
      publishedAt: article.publishedAt,
    }));

    res.status(200).json({ articles: summarizedNews });
  } catch (error) {
    console.error('Latest news error:', error.message);
    res.status(500).json({ error: 'Failed to fetch latest news' });
  }
});

// 🔹 GET /api/news/filters - For dashboard dropdowns
router.get('/filters', async (req, res) => {
  try {
    const categories = await News.distinct('category');
    const countries = await News.distinct('country');
    const states = await News.distinct('state');
    res.json({ categories, countries, states });
  } catch (error) {
    console.error('Error fetching filters:', error.message);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

// 🔹 GET /api/news/fetch-db - Authenticated, filtered news from DB
router.get('/fetch-db', authenticate, fetchNewsFromDB);

module.exports = router;
