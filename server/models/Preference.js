const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  newsTypes: [{
    type: String,
    enum: ['Technology', 'Sports', 'Politics', 'Entertainment', 'Business', 'Science', 'Health', 'Environment', 'General']
  }],
  countries: [{
    type: String
  }],
  states: [{
    type: String
  }],
  languages: [{
    type: String,
    default: ['en']
  }],
  notificationSettings: {
    email: {
      enabled: { type: Boolean, default: true },
      frequency: { 
        type: String, 
        enum: ['instant', 'daily', 'weekly', 'none'],
        default: 'daily'
      },
      timeOfDay: { type: String, default: '08:00' } // HH:mm format
    },
    whatsapp: {
      enabled: { type: Boolean, default: false },
      frequency: { 
        type: String, 
        enum: ['instant', 'daily', 'weekly', 'none'],
        default: 'none'
      },
      phoneNumber: { type: String }
    }
  },
  savedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News'
  }],
  readArticles: [{
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'News'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  blockedSources: [{
    type: String
  }],
  keywords: {
    include: [String],  // Keywords user wants to see
    exclude: [String]   // Keywords user wants to filter out
  }
}, { 
  timestamps: true 
});

// Note: unique index on userId is already created by the schema definition above

module.exports = mongoose.model('Preference', preferenceSchema);
