const axios = require('axios');
const News = require('../models/News');
const Preference = require('../models/Preference');
const User = require('../models/User');
const summarizer = require('../utils/summarizer');

// Fetch latest news from GNews API
exports.getLatestNews = async (req, res) => {
  try {
    const { category, country, lang, max } = req.query;
    const apiKey = process.env.GNEWS_API_KEY;

    const params = {
      lang: lang || 'en',
      country: country || 'in',
      max: max || 10,
      apikey: apiKey
    };

    if (category && category !== 'all') {
      params.category = category;
    }

    const response = await axios.get('https://gnews.io/api/v4/top-headlines', { params });

    const articles = response.data.articles.map(article => ({
      title: article.title,
      content: article.content,
      description: article.description,
      summary: article.description || article.content || 'No summary available.',
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: article.source.url
      }
    }));

    res.json({ articles, total: response.data.totalArticles });
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news', message: error.message });
  }
};

// Fetch personalized news based on user preferences
exports.getPersonalizedNews = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user preferences
    const preference = await Preference.findOne({ userId });
    const user = await User.findById(userId);

    if (!preference && !user) {
      return res.status(404).json({ message: 'User preferences not found' });
    }

    const apiKey = process.env.GNEWS_API_KEY;
    const newsTypes = preference?.newsTypes || user?.newsTypes || ['general'];
    const country = preference?.countries?.[0] || user?.country || 'in';
    
    // Fetch news for each preferred category
    const newsPromises = newsTypes.slice(0, 3).map(async (category) => {
      try {
        const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
          params: {
            category: category.toLowerCase(),
            lang: 'en',
            country: country.toLowerCase(),
            max: 5,
            apikey: apiKey
          }
        });
        return response.data.articles || [];
      } catch (err) {
        console.error(`Error fetching ${category} news:`, err.message);
        return [];
      }
    });

    const newsResults = await Promise.all(newsPromises);
    const allArticles = newsResults.flat();

    const articles = allArticles.map(article => ({
      title: article.title,
      content: article.content,
      description: article.description,
      summary: article.description || article.content || 'No summary available.',
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: article.source.url
      }
    }));

    res.json({ articles, total: articles.length });
  } catch (error) {
    console.error('Error fetching personalized news:', error.message);
    res.status(500).json({ error: 'Failed to fetch personalized news', message: error.message });
  }
};

// Search news by keyword
exports.searchNews = async (req, res) => {
  try {
    const { q, lang, country, max } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    const apiKey = process.env.GNEWS_API_KEY;

    const response = await axios.get('https://gnews.io/api/v4/search', {
      params: {
        q,
        lang: lang || 'en',
        country: country || 'in',
        max: max || 10,
        apikey: apiKey
      }
    });

    const articles = response.data.articles.map(article => ({
      title: article.title,
      content: article.content,
      description: article.description,
      summary: article.description || article.content || 'No summary available.',
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: {
        name: article.source.name,
        url: article.source.url
      }
    }));

    res.json({ articles, total: response.data.totalArticles });
  } catch (error) {
    console.error('Error searching news:', error.message);
    res.status(500).json({ error: 'Failed to search news', message: error.message });
  }
};

// Save news article to database
exports.saveArticle = async (req, res) => {
  try {
    const { title, content, description, category, url, image, publishedAt, source } = req.body;
    const userId = req.user.id;

    // Check if article already exists
    let article = await News.findOne({ url });

    if (article) {
      // Add user to savedBy if not already saved
      if (!article.savedBy.includes(userId)) {
        article.savedBy.push(userId);
        await article.save();
      }
    } else {
      // Create new article
      article = new News({
        title,
        content,
        description,
        category,
        url,
        image,
        publishedAt,
        source,
        summary: description,
        savedBy: [userId]
      });
      await article.save();
    }

    // Update user preferences
    const preference = await Preference.findOne({ userId });
    if (preference && !preference.savedArticles.includes(article._id)) {
      preference.savedArticles.push(article._id);
      await preference.save();
    }

    res.status(201).json({ message: 'Article saved successfully', article });
  } catch (error) {
    console.error('Error saving article:', error.message);
    res.status(500).json({ error: 'Failed to save article', message: error.message });
  }
};

// Get saved articles for a user
exports.getSavedArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    const preference = await Preference.findOne({ userId }).populate('savedArticles');

    if (!preference) {
      return res.json({ articles: [] });
    }

    res.json({ articles: preference.savedArticles });
  } catch (error) {
    console.error('Error fetching saved articles:', error.message);
    res.status(500).json({ error: 'Failed to fetch saved articles', message: error.message });
  }
};

// Remove saved article
exports.removeSavedArticle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    const preference = await Preference.findOne({ userId });
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    // Remove from savedArticles
    preference.savedArticles = preference.savedArticles.filter(
      id => id.toString() !== articleId
    );
    await preference.save();

    // Remove user from article's savedBy
    const article = await News.findById(articleId);
    if (article) {
      article.savedBy = article.savedBy.filter(id => id.toString() !== userId);
      await article.save();
    }

    res.json({ message: 'Article removed from saved list' });
  } catch (error) {
    console.error('Error removing saved article:', error.message);
    res.status(500).json({ error: 'Failed to remove article', message: error.message });
  }
};

// Summarize article using built-in summarizer
exports.summarizeArticle = async (req, res) => {
  try {
    const { text, max_length, min_length } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for summarization' });
    }

    // Use built-in extractive summarization
    let summary;
    
    if (max_length) {
      // Summarize by character length
      summary = summarizer.summarizeByLength(text, max_length * 5); // Approximate conversion
    } else {
      // Summarize by number of sentences (default: 3)
      const numSentences = Math.max(2, Math.min(5, Math.floor(text.length / 200)));
      summary = summarizer.summarize(text, numSentences);
    }

    res.json({ 
      summary,
      cached: false
    });
  } catch (error) {
    console.error('Error summarizing article:', error.message);
    res.status(500).json({ 
      error: 'Failed to summarize article', 
      message: error.message 
    });
  }
};

// Mark article as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;

    const preference = await Preference.findOne({ userId });
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    // Check if already marked as read
    const alreadyRead = preference.readArticles.some(
      item => item.articleId.toString() === articleId
    );

    if (!alreadyRead) {
      preference.readArticles.push({
        articleId,
        readAt: new Date()
      });
      await preference.save();
    }

    res.json({ message: 'Article marked as read' });
  } catch (error) {
    console.error('Error marking article as read:', error.message);
    res.status(500).json({ error: 'Failed to mark article as read', message: error.message });
  }
};
