const express = require('express');
const router = express.Router();
const {
  getConfig,
  saveConfig,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch
} = require('../controllers/masterController');
const {
  createScheme, getSchemes, updateScheme, deleteScheme
} = require('../controllers/loanSchemeConfigController');

// Ensure you have auth middleware if needed
// const { protect } = require('../middleware/authMiddleware'); 
// Assuming it's open or you add middleware in server.js or here
// I will not enforce protect immediately if it wasn't there before, but normally it should be.
// For now, let's keep it simple as per existing app structure.

// Config routes
router.route('/config')
  .get(getConfig)
  .post(saveConfig);

// Branch routes
router.route('/branch')
  .get(getBranches)
  .post(createBranch);

router.route('/branch/:id')
  .put(updateBranch)
  .delete(deleteBranch);

// Loan Scheme Config routes
router.route('/loan-schemes')
  .get(getSchemes)
  .post(createScheme);

router.route('/loan-schemes/:id')
  .put(updateScheme)
  .delete(deleteScheme);

module.exports = router;
