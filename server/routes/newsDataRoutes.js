const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();
const apiKey = process.env.NEWSDATA_API_KEY;
const User = require('../models/User'); // Adjust path based on your project structure

// 🔹 Clean summary fallback
function getCleanSummary(description) {
  return description && description.trim()
    ? description.trim()
    : "No summary available.";
}

// 🔹 Allowed categories and countries
const allowedCategories = [
  'top', 'business', 'entertainment', 'environment', 'food',
  'health', 'politics', 'science', 'sports', 'technology', 'tourism', 'world'
];
const allowedCountries = ['in', 'us', 'gb', 'au', 'ca', 'de', 'fr', 'it'];

// 🔹 Latest News Endpoint (Default: India, English, Top category)
router.get('/latest', async (req, res) => {
  try {
    const url = `https://newsdata.io/api/1/news`;
    const response = await axios.get(url, {
      params: {
        apikey: apiKey,
        country: 'in',
        language: 'en',
        category: 'top'
      }
    });

    const articles = (response.data.results || []).slice(0, 10).map(article => ({
      title: article.title,
      summary: getCleanSummary(article.description),
      url: article.link,
      image: article.image_url || null,
      publishedAt: article.pubDate,
      source: article.source_id || "Unknown"
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching latest news:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch latest news',
      message: error.response?.data?.message || error.message
    });
  }
});

// 🔹 Filtered News Endpoint (Optional query: category, country, max)
router.get('/filtered', async (req, res) => {
  try {
    const { category, country, max = 10 } = req.query;

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    if (country && !allowedCountries.includes(country)) {
      return res.status(400).json({ error: 'Invalid country code' });
    }

    const url = `https://newsdata.io/api/1/news`;
    const response = await axios.get(url, {
      params: {
        apikey: apiKey,
        language: 'en',
        ...(category && { category }),
        ...(country && { country })
      }
    });

    const articles = (response.data.results || []).slice(0, max).map(article => ({
      title: article.title,
      summary: getCleanSummary(article.description),
      url: article.link,
      image: article.image_url || null,
      publishedAt: article.pubDate,
      source: article.source_id || "Unknown"
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching filtered news:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch filtered news',
      message: error.response?.data?.message || error.message
    });
  }
});

// 🔹 Personalized News based on User Preferences
router.get('/personalized/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    // Fallback to default preferences if not found
    const country = user?.preferences?.country && allowedCountries.includes(user.preferences.country)
      ? user.preferences.country
      : 'in'; // default country

    const category = user?.preferences?.category && allowedCategories.includes(user.preferences.category)
      ? user.preferences.category
      : 'top'; // default category

    const response = await axios.get('https://newsdata.io/api/1/news', {
      params: {
        apikey: apiKey,
        language: 'en',
        country,
        category
      }
    });

    const articles = (response.data.results || []).slice(0, 10).map(article => ({
      title: article.title,
      summary: getCleanSummary(article.description),
      url: article.link,
      image: article.image_url || null,
      publishedAt: article.pubDate,
      source: article.source_id || "Unknown"
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error fetching personalized news:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch personalized news',
      message: error.response?.data?.message || error.message
    });
  }
});


module.exports = router;
