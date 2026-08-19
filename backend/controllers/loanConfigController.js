const Dealer = require('../models/Dealer');
const GoldRate = require('../models/GoldRate');
const ItemGroup = require('../models/ItemGroup');
const Locker = require('../models/Locker');
const Purity = require('../models/Purity');
const Valuer = require('../models/Valuer');
const Vehicle = require('../models/Vehicle');
const LoanCalculator = require('../models/LoanCalculator');

// Helper to create CRUD controllers for a given model
const createCRUD = (Model) => ({
  getAll: async (req, res) => {
    try {
      const docs = await Model.find().sort({ createdAt: -1 });
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getOne: async (req, res) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  create: async (req, res) => {
    try {
      const doc = new Model(req.body);
      const savedDoc = await doc.save();
      res.status(201).json({ success: true, data: savedDoc });
    } catch (error) {
      console.error('[loanConfigController create error]:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, data: doc });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

module.exports = {
  dealer: createCRUD(Dealer),
  goldRate: createCRUD(GoldRate),
  itemGroup: createCRUD(ItemGroup),
  locker: createCRUD(Locker),
  purity: createCRUD(Purity),
  valuer: createCRUD(Valuer),
  vehicle: createCRUD(Vehicle),
  loanCalculator: createCRUD(LoanCalculator)
};
