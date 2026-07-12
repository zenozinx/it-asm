const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  assetCode: { type: String, required: true },
  assetType: { type: String },
  username: { type: String },
  issueDescription: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  repairRemark: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);
