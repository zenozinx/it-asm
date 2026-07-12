const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ['Desktop', 'Laptop', 'Scanner', 'Printer', 'Router', 'Switch', 'Firewall', 'IoT Devices'] },
  department: { type: String, default: '' },
  username: { type: String, default: '' },
  assetCode: { type: String, required: true, unique: true, trim: true },
  hostname: { type: String, default: '' },
  ssd: { type: String, default: '' },
  ram: { type: String, default: '' },
  processor: { type: String, default: '' },
  serialNumber: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Functional', 'Need Replacement', 'Not Functional'], default: 'Functional' },
  location: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
