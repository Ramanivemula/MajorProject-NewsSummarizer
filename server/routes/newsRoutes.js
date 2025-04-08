const express = require('express');
const axios = require('axios');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// Simple dummy summarizer for now (we’ll plug in NLP next)
const dummySummarize = (content) => {
  const points = content.split('.').slice(0, 6);
  return points.map(p => `• ${p.trim()}`).filter(p => p.length > 2);
};

router.get('/fetch', authenticate, async (req, res) => {
  const { category = 'general', country = 'in' } = req.query;

  try {
    const url = `https://gnews.io/api/v4/top-headlines?lang=en&country=${country}&topic=${category}&token=${process.env.GNEWS_API_KEY}`;
    const response = await axios.get(url);

    const summarizedNews = response.data.articles.map(article => {
      const summary = dummySummarize(article.content || article.description || '');
      return {
        title: article.title,
        summary,
        url: article.url,
        image: article.image,
        source: article.source?.name || 'Unknown',
        publishedAt: article.publishedAt
      };
    });

    res.json({ articles: summarizedNews });
  } catch (err) {
    console.error('News fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
