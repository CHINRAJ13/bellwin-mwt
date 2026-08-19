const Company = require('../models/Company');
const Branch = require('../models/Branch');

// -- Company / Config Controllers --

exports.getConfig = async (req, res, next) => {
  try {
    const config = await Company.findOne();
    if (!config) {
      return res.status(200).json(null); // Return null if no config exists yet
    }
    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
};

exports.saveConfig = async (req, res, next) => {
  try {
    let config = await Company.findOne();
    if (config) {
      // Update existing
      config = await Company.findByIdAndUpdate(config._id, req.body, { returnDocument: 'after', runValidators: true });
    } else {
      // Create new
      config = await Company.create(req.body);
    }
    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
};

// -- Branch Controllers --

exports.getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.status(200).json({ branches });
  } catch (error) {
    next(error);
  }
};

exports.createBranch = async (req, res, next) => {
  try {
    const { branchName } = req.body;
    if (branchName) {
      const existingBranch = await Branch.findOne({ branchName: branchName.trim().toUpperCase() });
      if (existingBranch) {
        return res.status(400).json({ message: `Branch with name "${branchName.toUpperCase()}" already exists` });
      }
    }
    const branch = await Branch.create(req.body);
    res.status(201).json(branch);
  } catch (error) {
    next(error);
  }
};

exports.updateBranch = async (req, res, next) => {
  try {
    const { branchName } = req.body;
    if (branchName) {
      const existingBranch = await Branch.findOne({ 
        branchName: branchName.trim().toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingBranch) {
        return res.status(400).json({ message: `Branch with name "${branchName.toUpperCase()}" already exists` });
      }
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.status(200).json(branch);
  } catch (error) {
    next(error);
  }
};

exports.deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    next(error);
  }
};
