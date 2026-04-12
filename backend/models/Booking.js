const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  spaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // e.g., "2023-10-25"
  startTime: { type: String, required: true }, // e.g., "10:00"
  endTime: { type: String, required: true }, // e.g., "12:00"
  userName: String,
  spaceName: String
});

module.exports = mongoose.model('Booking', BookingSchema);