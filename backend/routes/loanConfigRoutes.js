const express = require('express');
const router = express.Router();
const loanConfigController = require('../controllers/loanConfigController');
const { protect } = require('../middleware/authMiddleware');

// Mount routes for a specific entity
const mountCRUD = (path, controller) => {
  router.get(path, protect, controller.getAll);
  router.get(`${path}/:id`, protect, controller.getOne);
  router.post(path, protect, controller.create);
  router.put(`${path}/:id`, protect, controller.update);
  router.delete(`${path}/:id`, protect, controller.delete);
};

mountCRUD('/dealer', loanConfigController.dealer);
mountCRUD('/gold-rate', loanConfigController.goldRate);
mountCRUD('/item-group', loanConfigController.itemGroup);
mountCRUD('/locker', loanConfigController.locker);
mountCRUD('/purity', loanConfigController.purity);
mountCRUD('/valuer', loanConfigController.valuer);
mountCRUD('/vehicle', loanConfigController.vehicle);
mountCRUD('/loan-calculator', loanConfigController.loanCalculator);

module.exports = router;
