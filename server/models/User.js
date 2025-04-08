const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  preferences: {
    newsTypes: [String], // Sports, Politics, etc.
    country: String,
    state: String,
    notifyDaily: { type: Boolean, default: false },
    deliveryMethod: [String], // ["email", "whatsapp"]
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
