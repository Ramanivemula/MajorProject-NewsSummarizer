const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: [String], // array of summarized bullet points
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String, // news category like sports, tech etc.
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
});

module.exports = mongoose.model('News', newsSchema);
