const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Smart Coworking System: MongoDB Connected! "))
  .catch(err => console.error("Database Connection Error: ", err));

// --- API Routes ---

// ১. স্পেস/রুম ম্যানেজমেন্ট রুট (Add, Edit, Delete Spaces)
app.use('/api/spaces', require('./routes/spaceroutes'));

// ২. ইউজার অথেনটিকেশন রুট (Login & Registration)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// ৩. অ্যাডভান্সড বুকিং রুট (Calendar, Slots & User Bookings)
app.use('/api/bookings', require('./routes/bookingroutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send("Nexus Coworking Server is Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));