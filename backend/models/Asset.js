const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetType: { type: String, required: true, enum: ['Desktop', 'Scanner', 'Printer'] },
  department: { type: String, required: true, enum: ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration'] },
  username: { type: String, required: true, trim: true },
  assetCode: { type: String, required: true, unique: true, trim: true },
  hostname: { type: String, required: true, trim: true },
  ssd: { type: String, required: true },
  ram: { type: String, required: true },
  processor: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true, trim: true },
  status: { type: String, required: true, enum: ['Functional', 'Need Replacement', 'Not Functional'], default: 'Functional' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

assetSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Asset', assetSchema);
