const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Space = require('../models/space'); // Space মডেলটি ইম্পোর্ট করা হয়েছে

// ১. নতুন বুকিং তৈরি (এবং স্পেসের স্ট্যাটাস আপডেট)
router.post('/add', async (req, res) => {
  try {
    const { spaceId, userId, date, startTime, endTime, userName, spaceName } = req.body;
    
    // চেক করা: ওই একই সময়ে অন্য কোনো বুকিং আছে কি না (Conflict Check)
    const existing = await Booking.findOne({ spaceId, date, startTime });
    if (existing) {
      return res.status(400).json({ message: "This slot is already taken! 🚫" });
    }

    // নতুন বুকিং তৈরি ও সেভ
    const newBooking = new Booking({ 
      spaceId, 
      userId, 
      date, 
      startTime, 
      endTime, 
      userName, 
      spaceName 
    });
    await newBooking.save();

    // --- স্পেসকে 'বুকড' হিসেবে মার্ক করা ---
    // বুকিং সফল হলে ওই নির্দিষ্ট স্পেসের isAvailable ফিল্ড false করে দেওয়া হচ্ছে
    await Space.findByIdAndUpdate(spaceId, { isAvailable: false });

    res.status(201).json({ message: "Booking Confirmed! " });
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ২. সব বুকিং দেখা (অ্যাডমিন প্যানেলের জন্য)
// এই রাউটের মাধ্যমে অ্যাডমিন দেখতে পারবে কোন ইউজার কোন স্পেস বুক করেছে
router.get('/all', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error("Admin Booking Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ৩. নির্দিষ্ট ইউজারের নিজস্ব বুকিং দেখা (User Dashboard এর জন্য)
router.get('/user/:id', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id });
    res.json(bookings);
  } catch (err) {
    console.error("User Booking Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;