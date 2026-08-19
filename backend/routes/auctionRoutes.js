const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Loan = require('../models/Loan');

// Get all auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await Auction.find().sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a loan to auction
router.post('/', async (req, res) => {
  try {
    const { loanId, auctionDate, auctionValue, remarks } = req.body;

    // Find the loan
    const loan = await Loan.findOne({ loanId });
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Create the auction entry
    const newAuction = new Auction({
      loanId: loan.loanId,
      loanObjectId: loan._id,
      customerId: loan.customerId,
      customerName: loan.name,
      auctionDate: auctionDate || new Date(),
      outstandingAmount: loan.remainingLoanAmount,
      goldWeight: loan.totalWt,
      auctionValue,
      remarks,
      auctionStatus: 'Auctioned'
    });

    await newAuction.save();

    // Update the loan status
    loan.status = 'Auctioned';
    await loan.save();

    res.status(201).json(newAuction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
