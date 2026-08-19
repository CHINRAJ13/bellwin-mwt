const express = require('express');
const router = express.Router();
const chittyGroupController = require('../controllers/chittyGroupController');

router.post('/', chittyGroupController.createGroup);
router.get('/', chittyGroupController.getGroups);
router.get('/:id', chittyGroupController.getGroupById);
router.put('/:id', chittyGroupController.updateGroup);
router.delete('/:id', chittyGroupController.deleteGroup);

module.exports = router;
