import { api } from './api.js';
import { showLoading, hideLoading, showNotification } from './utilities.js';

export function initDownload() {
  document.getElementById('download-btn')?.addEventListener('click', handleDownload);
}

async function handleDownload() {
  try {
    showLoading();
    const context = window.currentAssetContext || {};
    const params = {
      searchTerm: document.getElementById('search-input')?.value.trim() || '',
      status: document.getElementById('status-filter')?.value || 'All',
      assetType: context.assetType || '',
      department: context.department || ''
    };
    triggerDownload(api.getDownloadUrl(params), `assets_export_${today()}.csv`);
    showNotification('Download started successfully!');
  } catch (err) {
    showNotification('Failed to download data.', 'error');
  } finally {
    hideLoading();
  }
}

export function initDownloadAllBtn() {
  document.getElementById('download-all-btn')?.addEventListener('click', () => {
    triggerDownload(api.getDownloadAllUrl(), `all_assets_${today()}.csv`);
    showNotification('Download started successfully!');
  });
}

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
