const assetService = require('../services/assetService');

const MINIMAL_TYPES = ['Router', 'Switch', 'Firewall', 'IoT Devices'];

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await assetService.getAllAssets();
    res.json({ success: true, data: assets, count: assets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssetByCode = async (req, res) => {
  try {
    const asset = await assetService.getAssetByCode(req.params.assetCode);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, data: asset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssetsByType = async (req, res) => {
  try {
    const assets = await assetService.getAssetsByType(req.params.assetType);
    res.json({ success: true, data: assets, count: assets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssetsByDepartment = async (req, res) => {
  try {
    const assets = await assetService.getAssetsByDepartment(req.params.department);
    res.json({ success: true, data: assets, count: assets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAssetsByTypeAndDepartment = async (req, res) => {
  try {
    const assets = await assetService.getAssetsByTypeAndDepartment(req.params.assetType, req.params.department);
    res.json({ success: true, data: assets, count: assets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.searchAssets = async (req, res) => {
  try {
    const params = {
      searchTerm: req.query.q || '',
      assetType: req.query.assetType || '',
      department: req.query.department || '',
      status: req.query.status || 'All'
    };
    const assets = await assetService.searchAssets(params);
    res.json({ success: true, data: assets, count: assets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.globalSearch = async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const assets = await assetService.globalSearch(searchTerm);
    res.json({ success: true, data: assets, count: assets.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Asset code already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const asset = await assetService.deleteAsset(req.params.assetCode);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDepartmentsByAssetType = async (req, res) => {
  try {
    const departments = await assetService.getDepartmentsByAssetType(req.params.assetType);
    res.json({ success: true, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDepartmentCountsByAssetType = async (req, res) => {
  try {
    const counts = await assetService.getDepartmentCountsByAssetType(req.params.assetType);
    res.json({ success: true, data: counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await assetService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadAssetsCsv = async (req, res) => {
  try {
    const params = {
      searchTerm: req.query.q || '',
      assetType: req.query.assetType || '',
      department: req.query.department || '',
      status: req.query.status || 'All'
    };
    const assets = await assetService.searchAssets(params);
    const isMinimal = params.assetType && MINIMAL_TYPES.includes(params.assetType);
    const headers = isMinimal
      ? ['Username', 'Asset Code', 'Hostname', 'SSD', 'RAM', 'Processor', 'Serial Number', 'Location', 'Status']
      : ['Username', 'Asset Code', 'Hostname', 'SSD', 'RAM', 'Processor', 'Serial Number', 'Status'];
    const rows = [headers.join(',')];
    assets.forEach(a => {
      const cols = isMinimal
        ? [a.username, a.assetCode, a.hostname, a.ssd, a.ram, a.processor, a.serialNumber, a.location, a.status]
        : [a.username, a.assetCode, a.hostname, a.ssd, a.ram, a.processor, a.serialNumber, a.status];
      rows.push(cols.map(csvEscape).join(','));
    });
    const filename = `assets_${params.assetType || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(rows.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.downloadAllCsv = async (req, res) => {
  try {
    const TYPES = ['Desktop', 'Laptop', 'Scanner', 'Printer', 'Router', 'Switch', 'Firewall', 'IoT Devices'];
    const sections = [];
    for (const type of TYPES) {
      const assets = await assetService.getAssetsByType(type);
      const isMinimal = MINIMAL_TYPES.includes(type);
      const headers = isMinimal
        ? ['Username', 'Asset Code', 'Hostname', 'SSD', 'RAM', 'Processor', 'Serial Number', 'Location', 'Status']
        : ['Username', 'Asset Code', 'Hostname', 'SSD', 'RAM', 'Processor', 'Serial Number', 'Status'];
      sections.push(`${type} - ${assets.length} Assets`);
      sections.push(headers.join(','));
      assets.forEach(a => {
        const cols = isMinimal
          ? [a.username, a.assetCode, a.hostname, a.ssd, a.ram, a.processor, a.serialNumber, a.location, a.status]
          : [a.username, a.assetCode, a.hostname, a.ssd, a.ram, a.processor, a.serialNumber, a.status];
        sections.push(cols.map(csvEscape).join(','));
      });
      sections.push('--------------------------------------------');
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="all_assets_${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(sections.join('\n'));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
