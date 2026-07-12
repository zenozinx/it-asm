const Asset = require('../models/Asset');
const { FULL_ASSET_TYPES, MINIMAL_ASSET_TYPES } = require('../models/Asset');

class AssetService {
  async getAllAssets() { return await Asset.find({}).sort({ createdAt: -1 }); }

  async createAsset(data) {
    const { assetType, assetCode, serialNumber } = data;

    if (!assetType || !assetCode || !serialNumber) {
      return { success: false, message: 'Asset Type, Asset Code, and Serial Number are required' };
    }

    const isFullType = FULL_ASSET_TYPES.includes(assetType);
    const isMinimalType = MINIMAL_ASSET_TYPES.includes(assetType);

    if (isFullType && !data.department) {
      return { success: false, message: 'Department is required for this asset type' };
    }

    const existing = await Asset.findOne({ $or: [{ assetCode }, { serialNumber }] });
    if (existing) {
      return { success: false, message: 'An asset with this Asset Code or Serial Number already exists' };
    }

    const assetData = {
      assetType,
      department: isFullType ? (data.department || '') : '',
      assetCode,
      serialNumber,
      username: data.username || '',
      hostname: data.hostname || '',
      ssd: data.ssd || '',
      ram: data.ram || '',
      processor: data.processor || '',
      location: isMinimalType ? (data.location || '') : '',
      status: data.status || 'Functional'
    };

    const asset = new Asset(assetData);
    await asset.save();
    return { success: true, message: 'Asset added successfully', data: asset };
  }

  async getAssetByCode(assetCode) {
    return await Asset.findOne({ assetCode });
  }

  async deleteAsset(assetCode) {
    const asset = await Asset.findOne({ assetCode });
    if (!asset) {
      return { success: false, message: 'Asset not found with the provided Asset Code' };
    }
    await Asset.deleteOne({ _id: asset._id });
    return { success: true, message: 'Asset removed successfully', data: { assetCode } };
  }

  async getAssetsByType(assetType) { return await Asset.find({ assetType }).sort({ createdAt: -1 }); }
  async getAssetsByDepartment(department) { return await Asset.find({ department }).sort({ createdAt: -1 }); }
  async getAssetsByTypeAndDepartment(assetType, department) { return await Asset.find({ assetType, department }).sort({ createdAt: -1 }); }

  async searchAssets(searchTerm, filters = {}) {
    const query = {};
    if (filters.assetType) query.assetType = filters.assetType;
    if (filters.department) query.department = filters.department;

    if (searchTerm) {
      query.$or = [
        { username: { $regex: searchTerm, $options: 'i' } },
        { assetCode: { $regex: searchTerm, $options: 'i' } },
        { hostname: { $regex: searchTerm, $options: 'i' } },
        { serialNumber: { $regex: searchTerm, $options: 'i' } },
        { location: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (filters.status) query.status = filters.status;
    return await Asset.find(query).sort({ createdAt: -1 });
  }

  async getDepartmentsByAssetType(assetType) { return await Asset.find({ assetType }).distinct('department'); }

  async getAssetStats() {
    const total = await Asset.countDocuments();
    const byType = await Asset.aggregate([{ $group: { _id: '$assetType', count: { $sum: 1 } } }]);
    const byStatus = await Asset.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byDepartment = await Asset.aggregate([
      { $match: { department: { $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    return { total, byType, byStatus, byDepartment };
  }

  async globalSearch(searchTerm) {
    if (!searchTerm) return [];
    const query = {
      $or: [
        { username: { $regex: searchTerm, $options: 'i' } },
        { assetCode: { $regex: searchTerm, $options: 'i' } },
        { serialNumber: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    return await Asset.find(query).sort({ createdAt: -1 });
  }

  async getAllAssetsGrouped() {
    const allTypes = [...FULL_ASSET_TYPES, ...MINIMAL_ASSET_TYPES];
    const result = {};
    for (const type of allTypes) {
      result[type] = await Asset.find({ assetType: type }).sort({ createdAt: -1 });
    }
    return result;
  }
}

module.exports = new AssetService();
