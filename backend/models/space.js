const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // যেমন: Meeting Room, Desk
  pricePerHour: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = mongoose.model('Space', spaceSchema);