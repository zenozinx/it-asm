require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Asset = require('../models/Asset');

const sampleAssets = [
  { assetType: 'Desktop', department: 'IT', username: 'rahul.sharma', assetCode: 'DT-IT-001', hostname: 'IT-WS-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-12700', serialNumber: 'SN-IT-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'IT', username: 'priya.verma', assetCode: 'DT-IT-002', hostname: 'IT-WS-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400', serialNumber: 'SN-IT-002', status: 'Functional' },
  { assetType: 'Desktop', department: 'IT', username: 'amit.kumar', assetCode: 'DT-IT-003', hostname: 'IT-WS-003', ssd: '512GB SSD', ram: '32GB DDR4', processor: 'Intel Core i9-12900K', serialNumber: 'SN-IT-003', status: 'Functional' },
  { assetType: 'Desktop', department: 'IT', username: 'sneha.gupta', assetCode: 'DT-IT-004', hostname: 'IT-WS-004', ssd: '1TB SSD', ram: '16GB DDR4', processor: 'AMD Ryzen 7 5800X', serialNumber: 'SN-IT-004', status: 'Need Replacement' },
  { assetType: 'Desktop', department: 'Accounts', username: 'rajesh.patel', assetCode: 'DT-ACC-001', hostname: 'ACC-WS-001', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-10400', serialNumber: 'SN-ACC-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'Accounts', username: 'anita.singh', assetCode: 'DT-ACC-002', hostname: 'ACC-WS-002', ssd: '512GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400', serialNumber: 'SN-ACC-002', status: 'Functional' },
  { assetType: 'Desktop', department: 'Accounts', username: 'vikram.joshi', assetCode: 'DT-ACC-003', hostname: 'ACC-WS-003', ssd: '256GB SSD', ram: '4GB DDR4', processor: 'Intel Core i3-9100', serialNumber: 'SN-ACC-003', status: 'Not Functional' },
  { assetType: 'Desktop', department: 'HR', username: 'meera.reddy', assetCode: 'DT-HR-001', hostname: 'HR-WS-001', ssd: '512GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400', serialNumber: 'SN-HR-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'HR', username: 'kavitha.nair', assetCode: 'DT-HR-002', hostname: 'HR-WS-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-10400', serialNumber: 'SN-HR-002', status: 'Need Replacement' },
  { assetType: 'Desktop', department: 'Finance', username: 'suresh.menon', assetCode: 'DT-FIN-001', hostname: 'FIN-WS-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-11700', serialNumber: 'SN-FIN-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'Finance', username: 'lakshmi.iyer', assetCode: 'DT-FIN-002', hostname: 'FIN-WS-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400', serialNumber: 'SN-FIN-002', status: 'Functional' },
  { assetType: 'Desktop', department: 'Production', username: 'arun.das', assetCode: 'DT-PROD-001', hostname: 'PROD-WS-001', ssd: '1TB SSD', ram: '32GB DDR4', processor: 'Intel Core i7-12700K', serialNumber: 'SN-PROD-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'Production', username: 'deepak.rao', assetCode: 'DT-PROD-002', hostname: 'PROD-WS-002', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'AMD Ryzen 5 5600X', serialNumber: 'SN-PROD-002', status: 'Functional' },
  { assetType: 'Desktop', department: 'Production', username: 'nisha.banerjee', assetCode: 'DT-PROD-003', hostname: 'PROD-WS-003', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-10400', serialNumber: 'SN-PROD-003', status: 'Not Functional' },
  { assetType: 'Desktop', department: 'Marketing', username: 'karan.mehta', assetCode: 'DT-MKT-001', hostname: 'MKT-WS-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-11700', serialNumber: 'SN-MKT-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'Marketing', username: 'divya.chawla', assetCode: 'DT-MKT-002', hostname: 'MKT-WS-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400', serialNumber: 'SN-MKT-002', status: 'Need Replacement' },
  { assetType: 'Desktop', department: 'Administration', username: 'ravi.shastri', assetCode: 'DT-ADMIN-001', hostname: 'ADMIN-WS-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-12700', serialNumber: 'SN-ADMIN-001', status: 'Functional' },
  { assetType: 'Desktop', department: 'Administration', username: 'geeta.kapoor', assetCode: 'DT-ADMIN-002', hostname: 'ADMIN-WS-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-10400', serialNumber: 'SN-ADMIN-002', status: 'Functional' },
  { assetType: 'Scanner', department: 'Accounts', username: 'rajesh.patel', assetCode: 'SC-ACC-001', hostname: 'ACC-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'Canon DR-G2140', serialNumber: 'SC-ACC-001-SN', status: 'Functional' },
  { assetType: 'Scanner', department: 'Accounts', username: 'anita.singh', assetCode: 'SC-ACC-002', hostname: 'ACC-SC-002', ssd: 'N/A', ram: 'N/A', processor: 'Fujitsu fi-7160', serialNumber: 'SC-ACC-002-SN', status: 'Functional' },
  { assetType: 'Scanner', department: 'HR', username: 'meera.reddy', assetCode: 'SC-HR-001', hostname: 'HR-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'HP ScanJet Pro 3000', serialNumber: 'SC-HR-001-SN', status: 'Need Replacement' },
  { assetType: 'Scanner', department: 'Finance', username: 'suresh.menon', assetCode: 'SC-FIN-001', hostname: 'FIN-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'Canon DR-G2140', serialNumber: 'SC-FIN-001-SN', status: 'Functional' },
  { assetType: 'Scanner', department: 'Finance', username: 'lakshmi.iyer', assetCode: 'SC-FIN-002', hostname: 'FIN-SC-002', ssd: 'N/A', ram: 'N/A', processor: 'Fujitsu fi-7160', serialNumber: 'SC-FIN-002-SN', status: 'Functional' },
  { assetType: 'Scanner', department: 'IT', username: 'amit.kumar', assetCode: 'SC-IT-001', hostname: 'IT-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'Epson WorkForce ES-500W', serialNumber: 'SC-IT-001-SN', status: 'Functional' },
  { assetType: 'Scanner', department: 'Production', username: 'arun.das', assetCode: 'SC-PROD-001', hostname: 'PROD-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'Canon DR-G2140', serialNumber: 'SC-PROD-001-SN', status: 'Not Functional' },
  { assetType: 'Scanner', department: 'Marketing', username: 'karan.mehta', assetCode: 'SC-MKT-001', hostname: 'MKT-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'Brother ADS-4900W', serialNumber: 'SC-MKT-001-SN', status: 'Functional' },
  { assetType: 'Scanner', department: 'Administration', username: 'ravi.shastri', assetCode: 'SC-ADMIN-001', hostname: 'ADMIN-SC-001', ssd: 'N/A', ram: 'N/A', processor: 'HP ScanJet Pro 3000', serialNumber: 'SC-ADMIN-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'IT', username: 'rahul.sharma', assetCode: 'PR-IT-001', hostname: 'IT-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'HP LaserJet Pro M404dn', serialNumber: 'PR-IT-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'IT', username: 'priya.verma', assetCode: 'PR-IT-002', hostname: 'IT-PRT-002', ssd: 'N/A', ram: 'N/A', processor: 'Canon imageCLASS MF445dw', serialNumber: 'PR-IT-002-SN', status: 'Need Replacement' },
  { assetType: 'Printer', department: 'Accounts', username: 'rajesh.patel', assetCode: 'PR-ACC-001', hostname: 'ACC-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'HP LaserJet Pro M404dn', serialNumber: 'PR-ACC-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Accounts', username: 'vikram.joshi', assetCode: 'PR-ACC-002', hostname: 'ACC-PRT-002', ssd: 'N/A', ram: 'N/A', processor: 'Brother HL-L5200DW', serialNumber: 'PR-ACC-002-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'HR', username: 'meera.reddy', assetCode: 'PR-HR-001', hostname: 'HR-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'Canon imageCLASS MF445dw', serialNumber: 'PR-HR-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Finance', username: 'suresh.menon', assetCode: 'PR-FIN-001', hostname: 'FIN-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'HP LaserJet Pro MFP M3302dw', serialNumber: 'PR-FIN-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Finance', username: 'lakshmi.iyer', assetCode: 'PR-FIN-002', hostname: 'FIN-PRT-002', ssd: 'N/A', ram: 'N/A', processor: 'Xerox B235NI', serialNumber: 'PR-FIN-002-SN', status: 'Not Functional' },
  { assetType: 'Printer', department: 'Production', username: 'arun.das', assetCode: 'PR-PROD-001', hostname: 'PROD-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'HP LaserJet Enterprise M610dn', serialNumber: 'PR-PROD-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Production', username: 'deepak.rao', assetCode: 'PR-PROD-002', hostname: 'PROD-PRT-002', ssd: 'N/A', ram: 'N/A', processor: 'Canon imageRUNNER 2625i', serialNumber: 'PR-PROD-002-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Marketing', username: 'karan.mehta', assetCode: 'PR-MKT-001', hostname: 'MKT-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'HP LaserJet Pro M404dn', serialNumber: 'PR-MKT-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Marketing', username: 'divya.chawla', assetCode: 'PR-MKT-002', hostname: 'MKT-PRT-002', ssd: 'N/A', ram: 'N/A', processor: 'Epson WorkForce Pro WF-4830', serialNumber: 'PR-MKT-002-SN', status: 'Need Replacement' },
  { assetType: 'Printer', department: 'Administration', username: 'ravi.shastri', assetCode: 'PR-ADMIN-001', hostname: 'ADMIN-PRT-001', ssd: 'N/A', ram: 'N/A', processor: 'HP LaserJet Enterprise M610dn', serialNumber: 'PR-ADMIN-001-SN', status: 'Functional' },
  { assetType: 'Printer', department: 'Administration', username: 'geeta.kapoor', assetCode: 'PR-ADMIN-002', hostname: 'ADMIN-PRT-002', ssd: 'N/A', ram: 'N/A', processor: 'Canon imageRUNNER 2625i', serialNumber: 'PR-ADMIN-002-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'IT', username: 'rahul.sharma', assetCode: 'LP-IT-001', hostname: 'IT-LP-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-12700H', serialNumber: 'LP-IT-001-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'IT', username: 'priya.verma', assetCode: 'LP-IT-002', hostname: 'IT-LP-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400H', serialNumber: 'LP-IT-002-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'IT', username: 'amit.kumar', assetCode: 'LP-IT-003', hostname: 'IT-LP-003', ssd: '1TB SSD', ram: '32GB DDR4', processor: 'Apple M2 Pro', serialNumber: 'LP-IT-003-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'Accounts', username: 'rajesh.patel', assetCode: 'LP-ACC-001', hostname: 'ACC-LP-001', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-1135G7', serialNumber: 'LP-ACC-001-SN', status: 'Need Replacement' },
  { assetType: 'Laptop', department: 'Finance', username: 'suresh.menon', assetCode: 'LP-FIN-001', hostname: 'FIN-LP-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-1165G7', serialNumber: 'LP-FIN-001-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'HR', username: 'meera.reddy', assetCode: 'LP-HR-001', hostname: 'HR-LP-001', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-1135G7', serialNumber: 'LP-HR-001-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'Production', username: 'arun.das', assetCode: 'LP-PROD-001', hostname: 'PROD-LP-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'AMD Ryzen 7 5800H', serialNumber: 'LP-PROD-001-SN', status: 'Not Functional' },
  { assetType: 'Laptop', department: 'Marketing', username: 'karan.mehta', assetCode: 'LP-MKT-001', hostname: 'MKT-LP-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Apple M2', serialNumber: 'LP-MKT-001-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'Marketing', username: 'divya.chawla', assetCode: 'LP-MKT-002', hostname: 'MKT-LP-002', ssd: '256GB SSD', ram: '8GB DDR4', processor: 'Intel Core i5-11400H', serialNumber: 'LP-MKT-002-SN', status: 'Functional' },
  { assetType: 'Laptop', department: 'Administration', username: 'ravi.shastri', assetCode: 'LP-ADMIN-001', hostname: 'ADMIN-LP-001', ssd: '512GB SSD', ram: '16GB DDR4', processor: 'Intel Core i7-12700H', serialNumber: 'LP-ADMIN-001-SN', status: 'Functional' }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Clearing existing assets...');
    await Asset.deleteMany({});
    console.log('Inserting sample assets...');
    await Asset.insertMany(sampleAssets);
    console.log(`Successfully seeded ${sampleAssets.length} assets!`);
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
