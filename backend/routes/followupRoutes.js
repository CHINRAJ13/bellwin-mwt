const express = require('express');
const router = express.Router();
const Followup = require('../models/Followup');

// Create a new followup
router.post('/', async (req, res) => {
  try {
    const newFollowup = new Followup(req.body);
    await newFollowup.save();
    res.status(201).json({ success: true, data: newFollowup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all followups
router.get('/', async (req, res) => {
  try {
    const followups = await Followup.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: followups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
