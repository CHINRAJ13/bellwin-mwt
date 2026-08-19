const ChittyGroup = require('../models/ChittyGroup');

exports.createGroup = async (req, res) => {
    try {
        const newGroup = new ChittyGroup(req.body);
        const savedGroup = await newGroup.save();
        res.status(201).json({ success: true, data: savedGroup, message: 'Chitty Group created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getGroups = async (req, res) => {
    try {
        const groups = await ChittyGroup.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = await ChittyGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Chitty Group not found' });
        }
        res.status(200).json({ success: true, data: group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGroup = async (req, res) => {
    try {
        const group = await ChittyGroup.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        if (!group) {
            return res.status(404).json({ success: false, message: 'Chitty Group not found' });
        }
        res.status(200).json({ success: true, data: group, message: 'Chitty Group updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = await ChittyGroup.findByIdAndDelete(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Chitty Group not found' });
        }
        res.status(200).json({ success: true, message: 'Chitty Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
