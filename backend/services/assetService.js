const Asset = require('../models/Asset');

const MINIMAL_TYPES = ['Router', 'Switch', 'Firewall', 'IoT Devices'];
const DEPT_TYPES = ['Desktop', 'Laptop', 'Scanner', 'Printer'];
const DEPARTMENTS = ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration', 'Others'];

async function getAllAssets(filters = {}) {
  const query = buildQuery(filters);
  return Asset.find(query).lean();
}

async function getAssetByCode(assetCode) {
  return Asset.findOne({ assetCode }).lean();
}

async function getAssetsByType(assetType) {
  return Asset.find({ assetType }).lean();
}

async function getAssetsByDepartment(department) {
  return Asset.find({ department }).lean();
}

async function getAssetsByTypeAndDepartment(assetType, department) {
  return Asset.find({ assetType, department }).lean();
}

async function searchAssets(params = {}) {
  const query = buildQuery(params);
  return Asset.find(query).lean();
}

async function globalSearch(searchTerm) {
  if (!searchTerm) return [];
  const regex = new RegExp(searchTerm, 'i');
  return Asset.find({
    $or: [
      { username: regex },
      { assetCode: regex },
      { serialNumber: regex }
    ]
  }).lean();
}

async function createAsset(data) {
  const isMinimal = MINIMAL_TYPES.includes(data.assetType);
  const assetData = {
    assetType: data.assetType,
    assetCode: data.assetCode,
    serialNumber: data.serialNumber,
    username: data.username || '',
    hostname: data.hostname || '',
    ssd: data.ssd || '',
    ram: data.ram || '',
    processor: data.processor || '',
    status: data.status || 'Functional',
    department: isMinimal ? '' : (data.department || ''),
    location: isMinimal ? (data.location || '') : ''
  };
  const asset = new Asset(assetData);
  return asset.save();
}

async function deleteAsset(assetCode) {
  return Asset.findOneAndDelete({ assetCode });
}

async function getDepartmentsByAssetType(assetType) {
  return DEPARTMENTS;
}

async function getDepartmentCountsByAssetType(assetType) {
  const results = await Asset.aggregate([
    { $match: { assetType, department: { $in: DEPARTMENTS } } },
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  const countMap = {};
  results.forEach(r => { countMap[r._id] = r.count; });
  return DEPARTMENTS.map(dept => ({ department: dept, count: countMap[dept] || 0 }));
}

async function getStats() {
  const types = ['Desktop', 'Laptop', 'Scanner', 'Printer', 'Router', 'Switch', 'Firewall', 'IoT Devices'];
  const [byType, total] = await Promise.all([
    Asset.aggregate([{ $group: { _id: '$assetType', count: { $sum: 1 } } }]),
    Asset.countDocuments()
  ]);
  const typeMap = {};
  byType.forEach(r => { typeMap[r._id] = r.count; });
  return {
    total,
    byType: types.reduce((acc, t) => { acc[t] = typeMap[t] || 0; return acc; }, {})
  };
}

function buildQuery(params) {
  const query = {};
  if (params.assetType) query.assetType = params.assetType;
  if (params.department) query.department = params.department;
  if (params.status && params.status !== 'All') query.status = params.status;
  if (params.searchTerm) {
    const regex = new RegExp(params.searchTerm, 'i');
    query.$or = [
      { username: regex },
      { assetCode: regex },
      { hostname: regex },
      { serialNumber: regex }
    ];
  }
  return query;
}

module.exports = {
  getAllAssets,
  getAssetByCode,
  getAssetsByType,
  getAssetsByDepartment,
  getAssetsByTypeAndDepartment,
  searchAssets,
  globalSearch,
  createAsset,
  deleteAsset,
  getDepartmentsByAssetType,
  getDepartmentCountsByAssetType,
  getStats
};
