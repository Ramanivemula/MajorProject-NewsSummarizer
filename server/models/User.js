const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  newsTypes: [String],       // e.g., ["Sports", "Politics"]
  country: String,
  state: String,
  notifyDaily: { type: Boolean, default: false },
  deliveryMethod: { type: String, enum: ['email', 'whatsapp'], default: 'email' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
