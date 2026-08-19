const express = require('express');
const router = express.Router();
const Remittance = require('../models/Remittance');
const Counter = require('../models/Counter');

// Get next ID preview
router.get('/next-id', async (req, res) => {
  try {
    const type = req.query.type; // 'cash' or 'gold'
    const isGold = type === 'gold';
    const counterId = isGold ? 'goldRemittanceId' : 'cashRemittanceId';
    const prefix = isGold ? 'GOLD' : 'CASH';
    
    const counter = await Counter.findById(counterId);
    const nextSeq = (counter?.seq || 0) + 1;
    res.status(200).json({ success: true, nextId: `${prefix}${String(nextSeq).padStart(6, '0')}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new remittance
router.post('/', async (req, res) => {
  try {
    const newRemittance = new Remittance(req.body);
    await newRemittance.save();
    res.status(201).json({ success: true, data: newRemittance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all remittances
router.get('/', async (req, res) => {
  try {
    const remittances = await Remittance.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: remittances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
