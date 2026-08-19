const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createGoldScheme,
    getGoldSchemes,
    getGoldSchemeByCustomer,
    updateGoldScheme,
    deleteGoldScheme
} = require('../controllers/goldSchemeController');


router.post('/', protect, createGoldScheme);
router.get('/', protect, getGoldSchemes);
router.get('/customer/:customerId', protect, getGoldSchemeByCustomer);
router.put('/:id', protect, updateGoldScheme);
router.delete('/:id', protect, deleteGoldScheme);

module.exports = router;
