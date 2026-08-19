const express = require('express');
const router = express.Router();

const {
    getChittySchemes,
    getChittySchemeById,
    createChittyScheme,
    updateChittyScheme,
    deleteChittyScheme
} = require('../controllers/chittySchemeController');

// auth middleware removed

router.route('/')
    .get(getChittySchemes)
    .post(createChittyScheme);

router.route('/:id')
    .get(getChittySchemeById)
    .put(updateChittyScheme)
    .delete(deleteChittyScheme);

module.exports = router;
