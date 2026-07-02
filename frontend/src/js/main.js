import { initTheme } from './theme.js';
import { initNavigation, navigateTo, getCurrentContext } from './navigation.js';
import { initSearch, clearSearch } from './search.js';
import { initDownload } from './download.js';
import { initVisitorCounter } from './visitorCounter.js';
import { api } from './api.js';
import { showLoading, hideLoading, getUsername, detectUsername, getStatusClass } from './utilities.js';

window.currentAssetContext = null;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initNavigation();
  initVisitorCounter();
  initDownload();
  initContactModal();

  const username = detectUsername() || getUsername();
  updateUsernameDisplay(username);

  window.addEventListener('page:dashboard', handleDashboardPage);
  window.addEventListener('page:departments', handleDepartmentsPage);
  window.addEventListener('page:assets', handleAssetsPage);

  initSearch(async ({ searchTerm, status }) => {
    const context = getCurrentContext();
    if (context.assetType && context.department) {
      await loadAssetsData(context.assetType, context.department, searchTerm, status);
    }
  });
});

function updateUsernameDisplay(username) {
  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay) usernameDisplay.textContent = `Welcome, ${username}`;
}

function initContactModal() {
  const contactBtn = document.getElementById('contact-btn');
  const modalClose = document.getElementById('modal-close');
  const modal = document.getElementById('contact-modal');

  if (contactBtn) contactBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  if (modalClose) modalClose.addEventListener('click', () => modal.classList.add('hidden'));
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
}

async function handleDashboardPage() {
  showLoading();
  try {
    const response = await api.getStats();
    if (response.success && response.data) updateAssetCounts(response.data);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showEmptyDashboard();
  } finally {
    hideLoading();
  }
}

function updateAssetCounts(stats) {
  const counts = { Desktop: 0, Scanner: 0, Printer: 0 };
  if (stats.byType) stats.byType.forEach(item => { counts[item._id] = item.count; });
  document.getElementById('desktop-count').textContent = `${counts['Desktop'] || 0} Assets`;
  document.getElementById('scanner-count').textContent = `${counts['Scanner'] || 0} Assets`;
  document.getElementById('printer-count').textContent = `${counts['Printer'] || 0} Assets`;
}

function showEmptyDashboard() {
  document.getElementById('desktop-count').textContent = '0 Assets';
  document.getElementById('scanner-count').textContent = '0 Assets';
  document.getElementById('printer-count').textContent = '0 Assets';
}

async function handleDepartmentsPage(event) {
  const { assetType } = event.detail || getCurrentContext();
  if (!assetType) return;

  showLoading();
  try {
    const title = document.getElementById('department-title');
    if (title) title.textContent = `${assetType} - Departments`;

    const response = await api.getDepartmentsByAssetType(assetType);
    if (response.success && response.data) renderDepartments(response.data, assetType);
    else renderDepartments([], assetType);
  } catch (error) {
    console.error('Error loading departments:', error);
    renderDepartments([], assetType);
  } finally {
    hideLoading();
  }
}

function renderDepartments(departments, assetType) {
  const container = document.getElementById('department-cards');
  if (!container) return;

  const allDepartments = ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration'];
  const departmentsWithAssets = departments || [];

  container.innerHTML = allDepartments.map(dept => {
    const hasAssets = departmentsWithAssets.includes(dept);
    return `<div class="department-card ${hasAssets ? '' : 'disabled'}" data-department="${dept}"><h4>${dept}</h4></div>`;
  }).join('');

  container.querySelectorAll('.department-card:not(.disabled)').forEach(card => {
    card.addEventListener('click', () => {
      const department = card.dataset.department;
      navigateTo('assets', { assetType, department });
    });
  });
}

async function handleAssetsPage(event) {
  const { assetType, department } = event.detail || getCurrentContext();
  if (!assetType || !department) return;

  window.currentAssetContext = { assetType, department };
  clearSearch();
  showLoading();

  try {
    const title = document.getElementById('assets-title');
    if (title) title.textContent = `${assetType} - ${department}`;

    const subtitle = document.getElementById('assets-subtitle');
    if (subtitle) subtitle.textContent = `Viewing ${assetType.toLowerCase()} assets for ${department} department`;

    await loadAssetsData(assetType, department);
  } catch (error) {
    console.error('Error loading assets:', error);
    renderAssetsTable([]);
  } finally {
    hideLoading();
  }
}

async function loadAssetsData(assetType, department, searchTerm = '', status = 'All') {
  try {
    const params = { assetType, department, searchTerm, status: status !== 'All' ? status : undefined };
    let response;
    if (searchTerm || (status && status !== 'All')) response = await api.searchAssets(params);
    else response = await api.getAssetsByTypeAndDepartment(assetType, department);

    if (response.success) renderAssetsTable(response.data);
    else renderAssetsTable([]);
  } catch (error) {
    console.error('Error loading assets data:', error);
    renderAssetsTable([]);
  }
}

function renderAssetsTable(assets) {
  const tbody = document.getElementById('assets-tbody');
  const countEl = document.getElementById('table-count');
  if (!tbody) return;

  if (!assets || assets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 48px;"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><p style="color: var(--text-tertiary);">No assets found</p></div></td></tr>`;
    if (countEl) countEl.textContent = 'Showing 0 assets';
    return;
  }

  tbody.innerHTML = assets.map(asset => `
    <tr>
      <td>${escapeHtml(asset.username)}</td>
      <td>${escapeHtml(asset.assetCode)}</td>
      <td>${escapeHtml(asset.hostname)}</td>
      <td>${escapeHtml(asset.ssd)}</td>
      <td>${escapeHtml(asset.ram)}</td>
      <td>${escapeHtml(asset.processor)}</td>
      <td>${escapeHtml(asset.serialNumber)}</td>
      <td><span class="status-badge ${getStatusClass(asset.status)}">${escapeHtml(asset.status)}</span></td>
    </tr>
  `).join('');

  if (countEl) countEl.textContent = `Showing ${assets.length} asset${assets.length !== 1 ? 's' : ''}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
