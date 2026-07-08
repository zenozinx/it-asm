const Issue = require('../models/Issue');
const Asset = require('../models/Asset');

async function createIssue(data) {
  const { assetCode, issueDescription, date } = data;

  const asset = await Asset.findOne({ assetCode });
  if (!asset) {
    return { success: false, message: 'Asset not found with the provided Asset Code' };
  }
  if (asset.status !== 'Functional') {
    return { success: false, message: 'Asset is not Functional. Only Functional assets can be submitted.' };
  }

  asset.status = 'Not Functional';
  asset.updatedAt = Date.now();
  await asset.save();

  const issue = new Issue({
    assetCode: asset.assetCode,
    serialNumber: asset.serialNumber,
    username: asset.username || '',
    department: asset.department,
    assetType: asset.assetType,
    issueDescription,
    date: new Date(date),
    status: 'Open'
  });
  await issue.save();

  return { success: true, message: 'Asset submitted successfully. Status changed to Not Functional.', data: issue };
}

async function reissueAsset(assetCode, serialNumber, repairRemark) {
  const asset = await Asset.findOne({ assetCode, serialNumber });
  if (!asset) {
    return { success: false, message: 'Asset not found with the provided Asset Code and Serial Number' };
  }
  if (asset.status !== 'Not Functional') {
    return { success: false, message: 'Asset is not in Not Functional status. Only Not Functional assets can be reissued.' };
  }

  const issue = await Issue.findOne({ assetCode, serialNumber, status: 'Open' }).sort({ createdAt: -1 });
  if (!issue) {
    return { success: false, message: 'No open submission found for this asset' };
  }

  asset.status = 'Functional';
  asset.updatedAt = Date.now();
  await asset.save();

  issue.status = 'Resolved';
  issue.repairRemark = repairRemark;
  issue.resolvedAt = Date.now();
  issue.updatedAt = Date.now();
  await issue.save();

  return { success: true, message: 'Asset reissued successfully. Status changed to Functional.', data: { asset, issue } };
}

async function getIssues() {
  return Issue.find().sort({ createdAt: -1 });
}

async function getIssueById(id) {
  return Issue.findById(id);
}

module.exports = {
  createIssue,
  reissueAsset,
  getIssues,
  getIssueById
};
