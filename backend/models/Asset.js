const mongoose = require('mongoose');

const FULL_ASSET_TYPES = ['Desktop', 'Scanner', 'Printer', 'Laptop'];
const MINIMAL_ASSET_TYPES = ['Router', 'Switch', 'Firewall', 'IoT Devices'];
const ALL_ASSET_TYPES = [...FULL_ASSET_TYPES, ...MINIMAL_ASSET_TYPES];

const assetSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ALL_ASSET_TYPES },
  department: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, enum: ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration', 'Others', ''], default: '' },
  username: { type: String, trim: true, default: '' },
  assetCode: { type: String, required: true, unique: true, trim: true },
  hostname: { type: String, trim: true, default: '' },
  ssd: { type: String, default: '' },
  ram: { type: String, default: '' },
  processor: { type: String, default: '' },
  serialNumber: { type: String, required: true, unique: true, trim: true },
  location: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['Functional', 'Need Replacement', 'Not Functional', ''], default: 'Functional' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

assetSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Asset', assetSchema);
module.exports.FULL_ASSET_TYPES = FULL_ASSET_TYPES;
module.exports.MINIMAL_ASSET_TYPES = MINIMAL_ASSET_TYPES;
module.exports.ALL_ASSET_TYPES = ALL_ASSET_TYPES;
