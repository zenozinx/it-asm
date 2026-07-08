const Asset = require('../models/Asset');
const { FULL_ASSET_TYPES } = require('../models/Asset');

class AssetService {
  async getAllAssets() { return await Asset.find({}).sort({ createdAt: -1 }); }

  async createAsset(data) {
    const { assetType, department, assetCode, serialNumber } = data;

    if (!assetType || !department || !assetCode || !serialNumber) {
      return { success: false, message: 'Asset Type, Department, Asset Code, and Serial Number are required' };
    }

    const existing = await Asset.findOne({ $or: [{ assetCode }, { serialNumber }] });
    if (existing) {
      return { success: false, message: 'An asset with this Asset Code or Serial Number already exists' };
    }

    const isFullType = FULL_ASSET_TYPES.includes(assetType);
    const assetData = {
      assetType,
      department,
      assetCode,
      serialNumber,
      username: isFullType ? (data.username || '') : '',
      hostname: isFullType ? (data.hostname || '') : '',
      ssd: isFullType ? (data.ssd || '') : '',
      ram: isFullType ? (data.ram || '') : '',
      processor: isFullType ? (data.processor || '') : '',
      status: isFullType ? (data.status || 'Functional') : 'Functional'
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
        { serialNumber: { $regex: searchTerm, $options: 'i' } }
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
    const byDepartment = await Asset.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    return { total, byType, byStatus, byDepartment };
  }

  async globalSearch(searchTerm) {
    if (!searchTerm) return [];
    const query = {
      $or: [
        { assetCode: { $regex: searchTerm, $options: 'i' } },
        { serialNumber: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    return await Asset.find(query).sort({ createdAt: -1 });
  }
}

module.exports = new AssetService();
