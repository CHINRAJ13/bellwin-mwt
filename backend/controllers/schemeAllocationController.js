const SchemeAllocation = require('../models/SchemeAllocation');

exports.createAllocation = async (req, res) => {
    try {
        const newAllocation = new SchemeAllocation(req.body);
        const savedAllocation = await newAllocation.save();
        res.status(201).json({ success: true, data: savedAllocation, message: 'Scheme allocated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getAllocations = async (req, res) => {
    try {
        const allocations = await SchemeAllocation.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: allocations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllocationById = async (req, res) => {
    try {
        const allocation = await SchemeAllocation.findById(req.params.id);
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.status(200).json({ success: true, data: allocation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAllocation = async (req, res) => {
    try {
        const allocation = await SchemeAllocation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.status(200).json({ success: true, data: allocation, message: 'Allocation updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteAllocation = async (req, res) => {
    try {
        const allocation = await SchemeAllocation.findByIdAndDelete(req.params.id);
        if (!allocation) {
            return res.status(404).json({ success: false, message: 'Allocation not found' });
        }
        res.status(200).json({ success: true, message: 'Allocation deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
