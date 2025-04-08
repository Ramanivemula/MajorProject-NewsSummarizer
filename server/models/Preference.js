const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  newsTypes: {
    type: [String], // ['sports', 'politics']
    default: [],
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  dailySummary: {
    type: Boolean,
    default: false,
  },
  deliveryMethod: {
    type: [String], // ['email', 'whatsapp']
    default: [],
  },
});

module.exports = mongoose.model('Preference', preferenceSchema);
