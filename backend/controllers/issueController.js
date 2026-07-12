const Issue = require('../models/Issue');
const Asset = require('../models/Asset');

exports.issueAsset = async (req, res) => {
  try {
    const { assetCode, issueDescription } = req.body;
    const asset = await Asset.findOne({ assetCode }).lean();
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    const issue = await Issue.create({
      assetCode,
      assetType: asset.assetType,
      username: asset.username,
      issueDescription
    });
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reissueAsset = async (req, res) => {
  try {
    const { assetCode, serialNumber, repairRemark } = req.body;
    const asset = await Asset.findOne({ assetCode, serialNumber }).lean();
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found or serial number mismatch' });
    await Asset.updateOne({ assetCode }, { status: 'Functional' });
    res.json({ success: true, message: 'Asset reissued successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    const issues = await Issue.find().lean();
    res.json({ success: true, data: issues, count: issues.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
