const assetService = require('../services/assetService');

const AssetController = {
  async getAllAssets(req, res) {
    try {
      const assets = await assetService.getAllAssets();
      res.json({ success: true, data: assets, count: assets.length });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
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
      if (!q) {
        return res.json({ success: true, data: [], count: 0 });
      }
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
      const csvHeaders = 'Asset Type,Department,Username,Asset Code,Hostname,SSD,RAM,Processor,Serial Number,Status\n';
      const csvRows = assets.map(a => `"${a.assetType}","${a.department}","${a.username}","${a.assetCode}","${a.hostname}","${a.ssd}","${a.ram}","${a.processor}","${a.serialNumber}","${a.status}"`).join('\n');
      const csv = csvHeaders + csvRows;
      const filename = `assets_export_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
  }
};

module.exports = AssetController;
