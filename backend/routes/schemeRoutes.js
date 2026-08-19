const express = require('express');
const router = express.Router();
// auth middleware removed
const {
    createScheme,
    getSchemes,
    getSchemeById,
    updateScheme,
    deleteScheme
} = require('../controllers/schemeController');

router.post('/', createScheme);
router.get('/', getSchemes);
router.get('/:id', getSchemeById);
router.put('/:id', updateScheme);
router.delete('/:id', deleteScheme);

module.exports = router;
