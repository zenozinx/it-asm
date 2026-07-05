const issueService = require('../services/issueService');

async function issueAsset(req, res) {
  try {
    const { assetCode, serialNumber, username, department, assetType, issueDescription, date } = req.body;

    if (!assetCode || !serialNumber || !username || !department || !assetType || !issueDescription || !date) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const result = await issueService.createIssue(assetCode, serialNumber, username, department, assetType, issueDescription, date);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error issuing asset:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function reissueAsset(req, res) {
  try {
    const { assetCode, serialNumber, repairRemark } = req.body;

    if (!assetCode || !serialNumber || !repairRemark) {
      return res.status(400).json({ success: false, message: 'Asset Code, Serial Number, and Repair Remark are required' });
    }

    const result = await issueService.reissueAsset(assetCode, serialNumber, repairRemark);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error reissuing asset:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getIssues(req, res) {
  try {
    const issues = await issueService.getIssues();
    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  issueAsset,
  reissueAsset,
  getIssues
};
