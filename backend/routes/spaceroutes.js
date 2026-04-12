const express = require('express');
const router = express.Router();
const Space = require('../models/space');

// নতুন রুম যুক্ত করার API
router.post('/add', async (req, res) => {
  try {
    const newSpace = new Space(req.body);
    await newSpace.save();
    res.status(201).json({ message: "New space added successfully! 🎉" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// সব রুমের লিস্ট পাওয়ার API
router.get('/all', async (req, res) => {
  try {
    const spaces = await Space.find();
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// একটি নির্দিষ্ট রুম আপডেট করার রুট
router.put('/:id', async (req, res) => {
  try {
    const updatedSpace = await Space.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedSpace);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// রুম ডিলিট করার API
router.delete('/:id', async (req, res) => {
  try {
    const deletedSpace = await Space.findByIdAndDelete(req.params.id);
    if (!deletedSpace) {
      return res.status(404).json({ message: "Space not found!" });
    }
    res.status(200).json({ message: "Space deleted successfully! " });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;