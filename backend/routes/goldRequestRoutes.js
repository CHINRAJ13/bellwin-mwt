const express = require('express');
const router = express.Router();
const GoldRequest = require('../models/GoldRequest');
const Counter = require('../models/Counter');

// Get next ID preview
router.get('/next-id', async (req, res) => {
  try {
    const counter = await Counter.findById('goldRequestId');
    const nextSeq = (counter?.seq || 0) + 1;
    res.status(200).json({ success: true, nextId: `REQ${String(nextSeq).padStart(6, '0')}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new gold request
router.post('/', async (req, res) => {
  try {
    const newRequest = new GoldRequest(req.body);
    await newRequest.save();
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all gold requests
router.get('/', async (req, res) => {
  try {
    const { customerId, customerName, status } = req.query;
    let query = {};
    if (customerId) query.customerId = { $regex: new RegExp(customerId, 'i') };
    if (customerName) query.customerName = { $regex: new RegExp(customerName, 'i') };
    if (status) query.status = status;

    const requests = await GoldRequest.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update status of a request
router.put('/status/:id', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const request = await GoldRequest.findByIdAndUpdate(
      req.params.id,
      { status, remarks },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
