import { api } from './api.js';

export function initDownload() {
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) downloadBtn.addEventListener('click', handleDownload);
}

async function handleDownload() {
  try {
    showLoading();
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');

    const params = {
      searchTerm: searchInput ? searchInput.value.trim() : '',
      status: statusFilter ? statusFilter.value : 'All'
    };

    const context = window.currentAssetContext || {};
    if (context.assetType) params.assetType = context.assetType;
    if (context.department) params.department = context.department;

    const downloadUrl = api.getDownloadUrl(params);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `assets_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Download started successfully!', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showNotification('Failed to download data. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) existingNotification.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 100px; right: 20px; padding: 16px 24px;
    background: ${type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#dbeafe'};
    color: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#1e40af'};
    border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 3000; animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.add('hidden');
}

window.showNotification = showNotification;
