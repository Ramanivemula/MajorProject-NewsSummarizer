const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String 
  },
  description: { 
    type: String 
  },
  category: { 
    type: String,
    enum: ['Technology', 'Sports', 'Politics', 'Entertainment', 'Business', 'Science', 'Health', 'Environment', 'General'],
    default: 'General'
  },
  country: { 
    type: String,
    default: 'India'
  },
  state: { 
    type: String 
  },
  publishedAt: { 
    type: Date,
    default: Date.now
  },
  url: { 
    type: String,
    required: true,
    unique: true
  },
  image: { 
    type: String 
  },
  summary: { 
    type: String 
  },
  source: {
    name: { type: String },
    url: { type: String }
  },
  author: { 
    type: String 
  },
  language: {
    type: String,
    default: 'en'
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { 
  timestamps: true 
});

// Index for better query performance
newsSchema.index({ category: 1, country: 1, publishedAt: -1 });
// newsSchema.index({ url: 1 }); // REMOVED: url already has unique:true which creates an index
newsSchema.index({ title: 'text', content: 'text', description: 'text' });

module.exports = mongoose.model('News', newsSchema);
