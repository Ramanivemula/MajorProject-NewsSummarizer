const express = require('express');
const router = express.Router();
const Preference = require('../models/Preference');
const {authenticate} = require('../middleware/authMiddleware'); // middleware to protect routes

// 🔒 Save or update user preferences
router.post('/save', authenticate, async (req, res) => {
  const { newsTypes, country, state, dailySummary, deliveryMethod } = req.body;

  try {
    let preference = await Preference.findOne({ userId: req.user.id });

    if (preference) {
      preference.newsTypes = newsTypes;
      preference.country = country;
      preference.state = state;
      preference.dailySummary = dailySummary;
      preference.deliveryMethod = deliveryMethod;
    } else {
      preference = new Preference({
        userId: req.user.id,
        newsTypes,
        country,
        state,
        dailySummary,
        deliveryMethod,
      });
    }

    await preference.save();
    res.status(200).json({ message: 'Preferences saved successfully!', preference });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// 🔍 Get preferences
router.get('/get', authenticate, async (req, res) => {
  try {
    const preference = await Preference.findOne({ userId: req.user.id });
    res.status(200).json(preference);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching preferences' });
  }
});

module.exports = router;
