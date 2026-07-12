const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const issueController = require('../controllers/issueController');

router.get('/assets', assetController.getAllAssets);
router.post('/assets', assetController.createAsset);
router.get('/assets/search', assetController.searchAssets);
router.get('/assets/stats', assetController.getStats);
router.get('/assets/global-search', assetController.globalSearch);
router.get('/assets/download/csv', assetController.downloadAssetsCsv);
router.get('/assets/download/all', assetController.downloadAllCsv);
router.get('/assets/type/:assetType', assetController.getAssetsByType);
router.get('/assets/department/:department', assetController.getAssetsByDepartment);
router.get('/assets/type/:assetType/department/:department', assetController.getAssetsByTypeAndDepartment);
router.get('/assets/code/:assetCode', assetController.getAssetByCode);
router.delete('/assets/code/:assetCode', assetController.deleteAsset);
router.get('/departments/:assetType', assetController.getDepartmentsByAssetType);

router.post('/submits', issueController.issueAsset);
router.post('/submits/reissue', issueController.reissueAsset);
router.get('/submits', issueController.getIssues);

module.exports = router;
