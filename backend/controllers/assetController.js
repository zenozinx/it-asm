const assetService = require('../services/assetService');
const { FULL_ASSET_TYPES, MINIMAL_ASSET_TYPES } = require('../models/Asset');

const AssetController = {
  async getAllAssets(req, res) {
    try {
      const assets = await assetService.getAllAssets();
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async createAsset(req, res) {
    try {
      const result = await assetService.createAsset(req.body);
      if (result.success) res.status(201).json(result);
      else res.status(400).json(result);
    } catch (error) {
      console.error('Error creating asset:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  async getAssetByCode(req, res) {
    try {
      const asset = await assetService.getAssetByCode(req.params.assetCode);
      if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
      res.json({ success: true, data: asset });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async deleteAsset(req, res) {
    try {
      const result = await assetService.deleteAsset(req.params.assetCode);
      if (result.success) res.json(result);
      else res.status(404).json(result);
    } catch (error) {
      console.error('Error deleting asset:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  async getAssetsByType(req, res) {
    try {
      const assets = await assetService.getAssetsByType(req.params.assetType);
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async getAssetsByDepartment(req, res) {
    try {
      const assets = await assetService.getAssetsByDepartment(req.params.department);
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async getAssetsByTypeAndDepartment(req, res) {
    try {
      const { assetType, department } = req.params;
      const assets = await assetService.getAssetsByTypeAndDepartment(assetType, department);
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async searchAssets(req, res) {
    try {
      const { q, assetType, department, status } = req.query;
      const filters = {};
      if (assetType) filters.assetType = assetType;
      if (department) filters.department = department;
      if (status && status !== 'All') filters.status = status;
      const assets = await assetService.searchAssets(q || '', filters);
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async getDepartmentsByAssetType(req, res) {
    try {
      const departments = await assetService.getDepartmentsByAssetType(req.params.assetType);
      res.json({ success: true, data: departments });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async getStats(req, res) {
    try {
      const stats = await assetService.getAssetStats();
      res.json({ success: true, data: stats });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async globalSearch(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.json({ success: true, data: [], count: 0 });
      const assets = await assetService.globalSearch(q);
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async downloadAssetsCsv(req, res) {
    try {
      const { q, assetType, department, status } = req.query;
      const filters = {};
      if (assetType) filters.assetType = assetType;
      if (department) filters.department = department;
      if (status && status !== 'All') filters.status = status;

      const assets = await assetService.searchAssets(q || '', filters);
      const isMinimal = assetType && MINIMAL_ASSET_TYPES.includes(assetType);
      const csvHeaders = isMinimal
        ? 'Asset Type,Username,Asset Code,Hostname,SSD,RAM,Processor,Serial Number,Location,Status\n'
        : 'Asset Type,Department,Username,Asset Code,Hostname,SSD,RAM,Processor,Serial Number,Status\n';

      const val = (v) => `"${(v || '-').replace(/"/g, '""')}"`;
      const csvRows = assets.map(a => isMinimal
        ? `${val(a.assetType)},${val(a.username)},${val(a.assetCode)},${val(a.hostname)},${val(a.ssd)},${val(a.ram)},${val(a.processor)},${val(a.serialNumber)},${val(a.location)},${val(a.status)}`
        : `${val(a.assetType)},${val(a.department)},${val(a.username)},${val(a.assetCode)},${val(a.hostname)},${val(a.ssd)},${val(a.ram)},${val(a.processor)},${val(a.serialNumber)},${val(a.status)}`
      ).join('\n');

      const filename = `assets_export_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvHeaders + csvRows);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  },

  async downloadAllCsv(req, res) {
    try {
      const grouped = await assetService.getAllAssetsGrouped();
      const allTypes = [...FULL_ASSET_TYPES, ...MINIMAL_ASSET_TYPES];
      const val = (v) => `"${(v || '-').replace(/"/g, '""')}"`;
      const lines = [];

      for (const type of allTypes) {
        const assets = grouped[type] || [];
        const isMinimal = MINIMAL_ASSET_TYPES.includes(type);
        lines.push(`${type} - ${assets.length} Asset${assets.length !== 1 ? 's' : ''}`);
        if (isMinimal) {
          lines.push('Username,Asset Code,Hostname,SSD,RAM,Processor,Serial Number,Location,Status');
        } else {
          lines.push('Username,Asset Code,Hostname,SSD,RAM,Processor,Serial Number,Status');
        }
        if (assets.length === 0) {
          lines.push('No assets found');
        } else {
          assets.forEach(a => {
            if (isMinimal) {
              lines.push(`${val(a.username)},${val(a.assetCode)},${val(a.hostname)},${val(a.ssd)},${val(a.ram)},${val(a.processor)},${val(a.serialNumber)},${val(a.location)},${val(a.status)}`);
            } else {
              lines.push(`${val(a.username)},${val(a.assetCode)},${val(a.hostname)},${val(a.ssd)},${val(a.ram)},${val(a.processor)},${val(a.serialNumber)},${val(a.status)}`);
            }
          });
        }
        lines.push('--------------------------------------------');
        lines.push('');
      }

      const filename = `all_assets_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(lines.join('\n'));
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  }
};

module.exports = AssetController;
