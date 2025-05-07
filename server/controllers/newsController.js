const News = require('../models/News');
const User = require('../models/User');

const fetchNewsFromDB = async (req, res) => {
  try {
    console.log("Authenticated User:", req.user); // { id: '...' }

    const { category, country, state, timeRange } = req.query;
    const userId = req.user?.id;

    // 🔍 Fetch user preferences as fallback
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const query = {};

    // ✅ Prefer request query, fallback to user preferences
    query.category =
      category && category.toLowerCase() !== 'all'
        ? category
        : user.preferences.newsTypes?.[0] || undefined;

    query.country =
      country && country.toLowerCase() !== 'all'
        ? country
        : user.preferences.country || undefined;

    query.state =
      state && state.toLowerCase() !== 'all'
        ? state
        : user.preferences.state || undefined;

    // 🕒 Time filter
    if (timeRange) {
      const now = new Date();
      let fromDate;

      if (timeRange === 'week') {
        fromDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeRange === 'month') {
        fromDate = new Date(now.setMonth(now.getMonth() - 1));
      } else if (timeRange === 'year') {
        fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      if (fromDate) {
        query.publishedAt = { $gte: fromDate };
      }
    }

    // 🔍 Print final query being sent to MongoDB
    console.log('MongoDB query =>', query);

    // 🔽 Get filtered news
    let news = await News.find(query).sort({ publishedAt: -1 }).limit(50);

    // 🔄 Fallback: If no news found, return latest headlines
    if (news.length === 0) {
      console.log("No filtered news found, sending latest fallback news...");
      news = await News.find().sort({ publishedAt: -1 }).limit(10);
    }

    res.status(200).json(news);
  } catch (error) {
    console.error('Error fetching filtered news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

module.exports = { fetchNewsFromDB };
