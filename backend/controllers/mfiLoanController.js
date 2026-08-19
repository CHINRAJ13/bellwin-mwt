const MfiLoan = require('../models/MfiLoan');

exports.createMfiLoan = async (req, res, next) => {
    try {
        const newLoan = new MfiLoan(req.body);
        const savedLoan = await newLoan.save();
        res.status(201).json({ success: true, data: savedLoan, message: 'Micro Finance Loan Application Submitted' });
    } catch (error) {
        next(error);
    }
};

exports.getAllMfiLoans = async (req, res, next) => {
    try {
        const { fromDate, toDate } = req.query;
        let query = {};
        
        if (fromDate && toDate) {
            query.applicationDate = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        const loans = await MfiLoan.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: loans });
    } catch (error) {
        next(error);
    }
};
