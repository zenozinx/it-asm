const mongoose = require('mongoose');

const FULL_ASSET_TYPES = ['Desktop', 'Scanner', 'Printer', 'Laptop'];
const MINIMAL_ASSET_TYPES = ['Router', 'Switch', 'Firewall', 'IoT Devices'];
const ALL_ASSET_TYPES = [...FULL_ASSET_TYPES, ...MINIMAL_ASSET_TYPES];

const assetSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ALL_ASSET_TYPES },
  department: { type: String, required: true, enum: ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration', 'Others'] },
  username: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, trim: true, default: '' },
  assetCode: { type: String, required: true, unique: true, trim: true },
  hostname: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, trim: true, default: '' },
  ssd: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, default: '' },
  ram: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, default: '' },
  processor: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, default: '' },
  serialNumber: { type: String, required: true, unique: true, trim: true },
  status: { type: String, required: function() { return FULL_ASSET_TYPES.includes(this.assetType); }, enum: ['Functional', 'Need Replacement', 'Not Functional'], default: 'Functional' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

assetSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Asset', assetSchema);
module.exports.FULL_ASSET_TYPES = FULL_ASSET_TYPES;
module.exports.MINIMAL_ASSET_TYPES = MINIMAL_ASSET_TYPES;
module.exports.ALL_ASSET_TYPES = ALL_ASSET_TYPES;
