const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Preference = require('../models/Preference');
const sendEmail = require('../utils/sendEmail');

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

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, newsTypes, country, state, notifyDaily, deliveryMethod } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize news types
    const normalizedNewsTypes = newsTypes 
      ? newsTypes.split(',').map(t => normalizeNewsType(t.trim()))
      : [];

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      newsTypes: normalizedNewsTypes,
      country,
      state,
      notifyDaily,
      deliveryMethod
    });

    await user.save();

    // Create default preferences for the user
    const preference = new Preference({
      userId: user._id,
      newsTypes: normalizedNewsTypes,
      countries: country ? [country] : [],
      states: state ? [state] : [],
      notificationSettings: {
        email: {
          enabled: notifyDaily,
          frequency: notifyDaily ? 'daily' : 'none'
        },
        whatsapp: {
          enabled: deliveryMethod === 'whatsapp',
          frequency: deliveryMethod === 'whatsapp' && notifyDaily ? 'daily' : 'none'
        }
      }
    });

    await preference.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id,
        name: user.name, 
        email: user.email,
        newsTypes: user.newsTypes,
        country: user.country,
        state: user.state
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login user - send OTP
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save or update OTP
    await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP via email
    await sendEmail(
      email,
      'Your OTP for NewsSummarizer Login',
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Login OTP Verification</h2>
          <p>Your OTP for login is:</p>
          <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    );

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Verify OTP and complete login
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find OTP record
    const record = await Otp.findOne({ email });
    if (!record) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    // Verify OTP
    if (record.code !== otp.toString()) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Check if OTP expired
    if (record.expiresAt < new Date()) {
      return res.status(410).json({ message: 'OTP expired' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Delete used OTP
    await Otp.deleteOne({ email });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        newsTypes: user.newsTypes,
        country: user.country,
        state: user.state,
        notifyDaily: user.notifyDaily,
        deliveryMethod: user.deliveryMethod
      }
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const preference = await Preference.findOne({ userId: user._id });

    res.json({ 
      user,
      preference 
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, newsTypes, country, state, notifyDaily, deliveryMethod } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Normalize news types if provided
    let normalizedNewsTypes;
    if (newsTypes) {
      normalizedNewsTypes = Array.isArray(newsTypes) 
        ? newsTypes.map(t => normalizeNewsType(t))
        : newsTypes.split(',').map(t => normalizeNewsType(t.trim()));
    }

    // Update user fields
    if (name) user.name = name;
    if (normalizedNewsTypes) user.newsTypes = normalizedNewsTypes;
    if (country) user.country = country;
    if (state) user.state = state;
    if (typeof notifyDaily !== 'undefined') user.notifyDaily = notifyDaily;
    if (deliveryMethod) user.deliveryMethod = deliveryMethod;

    await user.save();

    // Update preferences
    const preference = await Preference.findOne({ userId: user._id });
    if (preference) {
      if (normalizedNewsTypes) preference.newsTypes = normalizedNewsTypes;
      if (country) preference.countries = [country];
      if (state) preference.states = [state];
      if (typeof notifyDaily !== 'undefined') {
        preference.notificationSettings.email.enabled = notifyDaily;
        preference.notificationSettings.email.frequency = notifyDaily ? 'daily' : 'none';
      }
      await preference.save();
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        newsTypes: user.newsTypes,
        country: user.country,
        state: user.state,
        notifyDaily: user.notifyDaily,
        deliveryMethod: user.deliveryMethod
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// Test email configuration
exports.testEmail = async (req, res) => {
  try {
    const to = req.query.to || req.body?.email || process.env.EMAIL_FROM;
    if (!to) return res.status(400).json({ message: 'Provide a recipient via ?to=' });

    await sendEmail(
      to,
      'Test Email from NewsSummarizer',
      `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Configuration Test</h2>
          <p>✅ If you receive this email, your email configuration is working correctly!</p>
        </div>
      `
    );
    res.json({ message: `✅ Test email sent to ${to}` });
  } catch (err) {
    console.error('Email test error:', err);
    res.status(500).json({ message: '❌ Failed to send test email', error: err.message });
  }
};
