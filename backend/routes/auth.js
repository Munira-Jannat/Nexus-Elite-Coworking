const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ১. রেজিস্ট্রেশন API (User/Admin Create)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // চেক করা: এই ইমেইল দিয়ে আগে অ্যাকাউন্ট খোলা হয়েছে কি না
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "This email is already registered! " });
    }

    // পাসওয়ার্ড সিকিউর (Hash) করা
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // নতুন ইউজার তৈরি
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'user' // রোল না দিলে অটোমেটিক 'user' সেট হবে
    });

    await newUser.save();
    res.status(201).json({ message: "User Created Successfully! " });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

// ২. লগইন API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ইউজার আছে কি না চেক করা
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found! " });
    }

    // পাসওয়ার্ড চেক করা
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password! " });
    }

    // টোকেন তৈরি করা (JWT)
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      'nexus_secret_key', 
      { expiresIn: '1h' }
    );

    // ফ্রন্টএন্ডে টোকেন এবং ইউজারের আইডি, নাম ও রোল পাঠানো
    // পরিবর্তন এখানে: id: user._id যোগ করা হয়েছে
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        role: user.role 
      } 
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = router;