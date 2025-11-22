const Preference = require('../models/Preference');
const User = require('../models/User');

// Helper function to normalize news types
const normalizeNewsType = (type) => {
  const typeMap = {
    'technology': 'Technology',
    'tech': 'Technology',
    'sports': 'Sports',
    'sport': 'Sports',
    'politics': 'Politics',
    'political': 'Politics',
    'entertainment': 'Entertainment',
    'business': 'Business',
    'science': 'Science',
    'health': 'Health',
    'environment': 'Environment',
    'education': 'General',
    'general': 'General',
    'news': 'General'
  };
  
  const normalized = typeMap[type.toLowerCase()];
  return normalized || type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    let preference = await Preference.findOne({ userId }).populate('savedArticles');

    // If no preference exists, create default one
    if (!preference) {
      const user = await User.findById(userId);
      preference = new Preference({
        userId,
        newsTypes: user?.newsTypes || [],
        countries: user?.country ? [user.country] : [],
        states: user?.state ? [user.state] : [],
        notificationSettings: {
          email: {
            enabled: user?.notifyDaily || false,
            frequency: user?.notifyDaily ? 'daily' : 'none'
          }
        }
      });
      await preference.save();
    }

    res.json({ preference });
  } catch (error) {
    console.error('Error fetching preferences:', error.message);
    res.status(500).json({ error: 'Failed to fetch preferences', message: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      newsTypes,
      countries,
      states,
      languages,
      notificationSettings,
      blockedSources,
      keywords
    } = req.body;

    let preference = await Preference.findOne({ userId });

    if (!preference) {
      // Create new preference if doesn't exist
      preference = new Preference({ userId });
    }

    // Normalize news types if provided
    const normalizedNewsTypes = newsTypes 
      ? newsTypes.map(t => normalizeNewsType(t))
      : null;

    // Update fields if provided
    if (normalizedNewsTypes) preference.newsTypes = normalizedNewsTypes;
    if (countries) preference.countries = countries;
    if (states) preference.states = states;
    if (languages) preference.languages = languages;
    if (notificationSettings) {
      preference.notificationSettings = {
        ...preference.notificationSettings,
        ...notificationSettings
      };
    }
    if (blockedSources) preference.blockedSources = blockedSources;
    if (keywords) {
      preference.keywords = {
        include: keywords.include || preference.keywords.include,
        exclude: keywords.exclude || preference.keywords.exclude
      };
    }

    await preference.save();

    // Also update user model for consistency
    const user = await User.findById(userId);
    if (user) {
      if (normalizedNewsTypes) user.newsTypes = normalizedNewsTypes;
      if (countries && countries[0]) user.country = countries[0];
      if (states && states[0]) user.state = states[0];
      if (notificationSettings?.email?.enabled !== undefined) {
        user.notifyDaily = notificationSettings.email.enabled;
      }
      await user.save();
    }

    res.json({ 
      message: 'Preferences updated successfully',
      preference 
    });
  } catch (error) {
    console.error('Error updating preferences:', error.message);
    res.status(500).json({ error: 'Failed to update preferences', message: error.message });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, whatsapp } = req.body;

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    if (email) {
      preference.notificationSettings.email = {
        ...preference.notificationSettings.email,
        ...email
      };
    }

    if (whatsapp) {
      preference.notificationSettings.whatsapp = {
        ...preference.notificationSettings.whatsapp,
        ...whatsapp
      };
    }

    await preference.save();

    res.json({ 
      message: 'Notification settings updated successfully',
      notificationSettings: preference.notificationSettings 
    });
  } catch (error) {
    console.error('Error updating notification settings:', error.message);
    res.status(500).json({ error: 'Failed to update notification settings', message: error.message });
  }
};

// Add keyword to include list
exports.addIncludeKeyword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    if (!preference.keywords.include.includes(keyword)) {
      preference.keywords.include.push(keyword);
      await preference.save();
    }

    res.json({ 
      message: 'Keyword added to include list',
      keywords: preference.keywords 
    });
  } catch (error) {
    console.error('Error adding keyword:', error.message);
    res.status(500).json({ error: 'Failed to add keyword', message: error.message });
  }
};

// Add keyword to exclude list
exports.addExcludeKeyword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ message: 'Keyword is required' });
    }

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    if (!preference.keywords.exclude.includes(keyword)) {
      preference.keywords.exclude.push(keyword);
      await preference.save();
    }

    res.json({ 
      message: 'Keyword added to exclude list',
      keywords: preference.keywords 
    });
  } catch (error) {
    console.error('Error adding keyword:', error.message);
    res.status(500).json({ error: 'Failed to add keyword', message: error.message });
  }
};

// Remove keyword from include list
exports.removeIncludeKeyword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.params;

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    preference.keywords.include = preference.keywords.include.filter(k => k !== keyword);
    await preference.save();

    res.json({ 
      message: 'Keyword removed from include list',
      keywords: preference.keywords 
    });
  } catch (error) {
    console.error('Error removing keyword:', error.message);
    res.status(500).json({ error: 'Failed to remove keyword', message: error.message });
  }
};

// Remove keyword from exclude list
exports.removeExcludeKeyword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword } = req.params;

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    preference.keywords.exclude = preference.keywords.exclude.filter(k => k !== keyword);
    await preference.save();

    res.json({ 
      message: 'Keyword removed from exclude list',
      keywords: preference.keywords 
    });
  } catch (error) {
    console.error('Error removing keyword:', error.message);
    res.status(500).json({ error: 'Failed to remove keyword', message: error.message });
  }
};

// Block a news source
exports.blockSource = async (req, res) => {
  try {
    const userId = req.user.id;
    const { source } = req.body;

    if (!source) {
      return res.status(400).json({ message: 'Source is required' });
    }

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    if (!preference.blockedSources.includes(source)) {
      preference.blockedSources.push(source);
      await preference.save();
    }

    res.json({ 
      message: 'Source blocked successfully',
      blockedSources: preference.blockedSources 
    });
  } catch (error) {
    console.error('Error blocking source:', error.message);
    res.status(500).json({ error: 'Failed to block source', message: error.message });
  }
};

// Unblock a news source
exports.unblockSource = async (req, res) => {
  try {
    const userId = req.user.id;
    const { source } = req.params;

    const preference = await Preference.findOne({ userId });
    
    if (!preference) {
      return res.status(404).json({ message: 'Preferences not found' });
    }

    preference.blockedSources = preference.blockedSources.filter(s => s !== source);
    await preference.save();

    res.json({ 
      message: 'Source unblocked successfully',
      blockedSources: preference.blockedSources 
    });
  } catch (error) {
    console.error('Error unblocking source:', error.message);
    res.status(500).json({ error: 'Failed to unblock source', message: error.message });
  }
};

// Get reading history
exports.getReadingHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;

    const preference = await Preference.findOne({ userId })
      .populate({
        path: 'readArticles.articleId',
        options: { sort: { 'readArticles.readAt': -1 }, limit: parseInt(limit) }
      });

    if (!preference) {
      return res.json({ history: [] });
    }

    res.json({ 
      history: preference.readArticles
        .sort((a, b) => b.readAt - a.readAt)
        .slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching reading history:', error.message);
    res.status(500).json({ error: 'Failed to fetch reading history', message: error.message });
  }
};
