const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/assets', assetController.getAllAssets);
router.get('/assets/search', assetController.searchAssets);
router.get('/assets/stats', assetController.getStats);
router.get('/assets/download/csv', assetController.downloadAssetsCsv);
router.get('/assets/type/:assetType', assetController.getAssetsByType);
router.get('/assets/department/:department', assetController.getAssetsByDepartment);
router.get('/assets/type/:assetType/department/:department', assetController.getAssetsByTypeAndDepartment);
router.get('/departments/:assetType', assetController.getDepartmentsByAssetType);

module.exports = router;
