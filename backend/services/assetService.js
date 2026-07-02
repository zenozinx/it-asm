const Asset = require('../models/Asset');

class AssetService {
  async getAllAssets() { return await Asset.find({}).sort({ createdAt: -1 }); }
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
}

module.exports = new AssetService();
