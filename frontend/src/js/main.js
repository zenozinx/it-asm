import { initTheme } from './theme.js';
import { initNavigation, navigateTo, getCurrentContext } from './navigation.js';
import { initSearch, clearSearch } from './search.js';
import { initDownload } from './download.js';
import { initVisitorCounter } from './visitorCounter.js';
import { api } from './api.js';
import { showLoading, hideLoading, getUsername, detectUsername, getStatusClass } from './utilities.js';

const FULL_ASSET_TYPES = ['Desktop', 'Laptop', 'Scanner', 'Printer'];
const MINIMAL_ASSET_TYPES = ['Router', 'Switch', 'Firewall', 'IoT Devices'];
const ALL_DEPARTMENTS = ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration', 'Others'];

window.currentAssetContext = null;

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initNavigation();
  initVisitorCounter();
  initDownload();
  initContactModal();
  initGlobalSearch();
  initAddAssetModal();
  initSubmitModal();
  initReissueModal();
  initRemoveAssetModal();

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
  const counts = { Desktop: 0, Scanner: 0, Printer: 0, Laptop: 0, Router: 0, Switch: 0, Firewall: 0, 'IoT Devices': 0 };
  if (stats.byType) stats.byType.forEach(item => { counts[item._id] = item.count; });
  document.getElementById('desktop-count').textContent = `${counts['Desktop'] || 0} Assets`;
  document.getElementById('scanner-count').textContent = `${counts['Scanner'] || 0} Assets`;
  document.getElementById('printer-count').textContent = `${counts['Printer'] || 0} Assets`;
  document.getElementById('laptop-count').textContent = `${counts['Laptop'] || 0} Assets`;
  document.getElementById('router-count').textContent = `${counts['Router'] || 0} Assets`;
  document.getElementById('switch-count').textContent = `${counts['Switch'] || 0} Assets`;
  document.getElementById('firewall-count').textContent = `${counts['Firewall'] || 0} Assets`;
  document.getElementById('iot-count').textContent = `${counts['IoT Devices'] || 0} Assets`;
}

function showEmptyDashboard() {
  document.getElementById('desktop-count').textContent = '0 Assets';
  document.getElementById('scanner-count').textContent = '0 Assets';
  document.getElementById('printer-count').textContent = '0 Assets';
  document.getElementById('laptop-count').textContent = '0 Assets';
  document.getElementById('router-count').textContent = '0 Assets';
  document.getElementById('switch-count').textContent = '0 Assets';
  document.getElementById('firewall-count').textContent = '0 Assets';
  document.getElementById('iot-count').textContent = '0 Assets';
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

  const departmentsWithAssets = departments || [];

  container.innerHTML = ALL_DEPARTMENTS.map(dept => {
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

  tbody.innerHTML = assets.map(asset => {
    const displayVal = (v) => v || '-';
    return `
    <tr>
      <td>${escapeHtml(displayVal(asset.username))}</td>
      <td>${escapeHtml(asset.assetCode)}</td>
      <td>${escapeHtml(displayVal(asset.hostname))}</td>
      <td>${escapeHtml(displayVal(asset.ssd))}</td>
      <td>${escapeHtml(displayVal(asset.ram))}</td>
      <td>${escapeHtml(displayVal(asset.processor))}</td>
      <td>${escapeHtml(asset.serialNumber)}</td>
      <td>${asset.status ? `<span class="status-badge ${getStatusClass(asset.status)}">${escapeHtml(asset.status)}</span>` : '-'}</td>
    </tr>`;
  }).join('');

  if (countEl) countEl.textContent = `Showing ${assets.length} asset${assets.length !== 1 ? 's' : ''}`;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  const searchBtn = document.getElementById('global-search-btn');
  const resultsContainer = document.getElementById('global-search-results');
  const tbody = document.getElementById('global-search-tbody');

  const performSearch = async () => {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
      resultsContainer.classList.add('hidden');
      return;
    }

    showLoading();
    try {
      const response = await api.globalSearch(searchTerm);
      if (response.success && response.data && response.data.length > 0) {
        tbody.innerHTML = response.data.map(asset => {
          const displayVal = (v) => v || '-';
          return `
          <tr>
            <td>${escapeHtml(asset.assetType)}</td>
            <td>${escapeHtml(asset.department)}</td>
            <td>${escapeHtml(displayVal(asset.username))}</td>
            <td>${escapeHtml(asset.assetCode)}</td>
            <td>${escapeHtml(asset.serialNumber)}</td>
            <td>${asset.status ? `<span class="status-badge ${getStatusClass(asset.status)}">${escapeHtml(asset.status)}</span>` : '-'}</td>
          </tr>`;
        }).join('');
        resultsContainer.classList.remove('hidden');
      } else {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">No assets found</td></tr>';
        resultsContainer.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Global search error:', error);
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 24px;">Error searching assets</td></tr>';
      resultsContainer.classList.remove('hidden');
    } finally {
      hideLoading();
    }
  };

  if (searchBtn) searchBtn.addEventListener('click', performSearch);
  if (searchInput) searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

function initAddAssetModal() {
  const modal = document.getElementById('add-asset-modal');
  const closeBtn = document.getElementById('add-asset-modal-close');
  const cancelBtn = document.getElementById('add-asset-cancel-btn');
  const form = document.getElementById('add-asset-form');
  const addBtn = document.getElementById('add-asset-btn');
  const assetTypeSelect = document.getElementById('add-asset-type');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      toggleAddAssetFields('Desktop');
      modal.classList.remove('hidden');
    });
  }

  if (assetTypeSelect) {
    assetTypeSelect.addEventListener('change', (e) => {
      toggleAddAssetFields(e.target.value);
    });
  }

  const closeModal = () => {
    modal.classList.add('hidden');
    form.reset();
    toggleAddAssetFields('Desktop');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      showLoading();
      try {
        const response = await api.createAsset(data);
        if (response.success) {
          showNotification(response.message, 'success');
          closeModal();
          await handleDashboardPage();
          if (window.currentAssetContext) {
            await loadAssetsData(window.currentAssetContext.assetType, window.currentAssetContext.department);
          }
        } else {
          showNotification(response.message, 'error');
        }
      } catch (error) {
        console.error('Add asset error:', error);
        showNotification('Failed to add asset. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    });
  }
}

function toggleAddAssetFields(assetType) {
  const isFullType = FULL_ASSET_TYPES.includes(assetType);
  const fullFieldIds = ['add-username-group', 'add-hostname-group', 'add-ssd-group', 'add-ram-group', 'add-processor-group', 'add-status-group'];
  fullFieldIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = isFullType ? '' : 'none';
  });
}

function initSubmitModal() {
  const modal = document.getElementById('issue-modal');
  const closeBtn = document.getElementById('issue-modal-close');
  const cancelBtn = document.getElementById('issue-cancel-btn');
  const submitBtn = document.getElementById('issue-asset-btn');
  const stage1 = document.getElementById('issue-stage-1');
  const stage2 = document.getElementById('issue-stage-2');
  const stage3 = document.getElementById('issue-stage-3');
  const stage1Form = document.getElementById('issue-stage1-form');
  const stage3Form = document.getElementById('issue-stage3-form');
  const stage2BackBtn = document.getElementById('issue-stage2-back-btn');
  const stage2NextBtn = document.getElementById('issue-stage2-next-btn');
  const stage3BackBtn = document.getElementById('issue-stage3-back-btn');

  let retrievedAsset = null;

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      resetSubmitModal();
      modal.classList.remove('hidden');
    });
  }

  function resetSubmitModal() {
    retrievedAsset = null;
    if (stage1Form) stage1Form.reset();
    if (stage3Form) stage3Form.reset();
    showStage(1);
  }

  function showStage(stage) {
    stage1.classList.toggle('hidden', stage !== 1);
    stage2.classList.toggle('hidden', stage !== 2);
    stage3.classList.toggle('hidden', stage !== 3);
  }

  const closeModal = () => {
    modal.classList.add('hidden');
    resetSubmitModal();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  if (stage1Form) {
    stage1Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const assetCode = document.getElementById('issue-asset-code').value.trim();
      if (!assetCode) return;

      showLoading();
      try {
        const response = await api.getAssetByCode(assetCode);
        if (response.success && response.data) {
          retrievedAsset = response.data;
          renderAssetInfo(retrievedAsset);
          showStage(2);
        } else {
          showNotification(response.message || 'Asset not found', 'error');
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
        showNotification('Failed to fetch asset information. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    });
  }

  if (stage2BackBtn) stage2BackBtn.addEventListener('click', () => showStage(1));
  if (stage2NextBtn) stage2NextBtn.addEventListener('click', () => showStage(3));
  if (stage3BackBtn) stage3BackBtn.addEventListener('click', () => showStage(2));

  if (stage3Form) {
    stage3Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!retrievedAsset) {
        showNotification('No asset selected. Please start over.', 'error');
        return;
      }

      const issueDescription = document.getElementById('issue-description').value.trim();
      if (!issueDescription) return;

      const data = {
        assetCode: retrievedAsset.assetCode,
        issueDescription,
        date: new Date().toISOString()
      };

      showLoading();
      try {
        const response = await api.submitAsset(data);
        if (response.success) {
          showNotification(response.message, 'success');
          closeModal();
          await handleDashboardPage();
          if (window.currentAssetContext) {
            await loadAssetsData(window.currentAssetContext.assetType, window.currentAssetContext.department);
          }
        } else {
          showNotification(response.message, 'error');
        }
      } catch (error) {
        console.error('Submit asset error:', error);
        showNotification('Failed to submit asset. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    });
  }
}

function renderAssetInfo(asset) {
  const container = document.getElementById('asset-info-display');
  if (!container) return;

  const displayVal = (v) => v || '-';
  const rows = [
    { label: 'Asset Type', value: asset.assetType },
    { label: 'Department', value: asset.department },
    { label: 'Username', value: displayVal(asset.username) },
    { label: 'Asset Code', value: asset.assetCode },
    { label: 'Hostname', value: displayVal(asset.hostname) },
    { label: 'SSD', value: displayVal(asset.ssd) },
    { label: 'RAM', value: displayVal(asset.ram) },
    { label: 'Processor', value: displayVal(asset.processor) },
    { label: 'Serial Number', value: asset.serialNumber },
    { label: 'Current Status', value: asset.status || '-' }
  ];

  container.innerHTML = rows.map(row => `
    <div class="asset-info-row">
      <span class="asset-info-label">${escapeHtml(row.label)}</span>
      <span class="asset-info-value">${escapeHtml(row.value)}</span>
    </div>
  `).join('');
}

function initReissueModal() {
  const modal = document.getElementById('reissue-modal');
  const closeBtn = document.getElementById('reissue-modal-close');
  const cancelBtn = document.getElementById('reissue-cancel-btn');
  const form = document.getElementById('reissue-form');
  const reissueBtn = document.getElementById('reissue-asset-btn');

  if (reissueBtn) {
    reissueBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  }

  const closeModal = () => {
    modal.classList.add('hidden');
    form.reset();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        assetCode: formData.get('assetCode'),
        serialNumber: formData.get('serialNumber'),
        repairRemark: formData.get('repairRemark')
      };

      showLoading();
      try {
        const response = await api.reissueAsset(data);
        if (response.success) {
          showNotification(response.message, 'success');
          closeModal();
          await handleDashboardPage();
          if (window.currentAssetContext) {
            await loadAssetsData(window.currentAssetContext.assetType, window.currentAssetContext.department);
          }
        } else {
          showNotification(response.message, 'error');
        }
      } catch (error) {
        console.error('Reissue asset error:', error);
        showNotification('Failed to reissue asset. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    });
  }
}

function initRemoveAssetModal() {
  const modal = document.getElementById('remove-asset-modal');
  const closeBtn = document.getElementById('remove-asset-modal-close');
  const cancelBtn = document.getElementById('remove-cancel-btn');
  const removeBtn = document.getElementById('remove-asset-btn');
  const stage1 = document.getElementById('remove-stage-1');
  const stage2 = document.getElementById('remove-stage-2');
  const stage3 = document.getElementById('remove-stage-3');
  const stage1Form = document.getElementById('remove-stage1-form');
  const stage2BackBtn = document.getElementById('remove-stage2-back-btn');
  const stage2DeleteBtn = document.getElementById('remove-stage2-delete-btn');
  const confirmCancelBtn = document.getElementById('remove-confirm-cancel-btn');
  const confirmDeleteBtn = document.getElementById('remove-confirm-delete-btn');

  let retrievedAsset = null;

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      resetRemoveModal();
      modal.classList.remove('hidden');
    });
  }

  function resetRemoveModal() {
    retrievedAsset = null;
    if (stage1Form) stage1Form.reset();
    showRemoveStage(1);
  }

  function showRemoveStage(stage) {
    stage1.classList.toggle('hidden', stage !== 1);
    stage2.classList.toggle('hidden', stage !== 2);
    stage3.classList.toggle('hidden', stage !== 3);
  }

  const closeModal = () => {
    modal.classList.add('hidden');
    resetRemoveModal();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  if (stage1Form) {
    stage1Form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const assetCode = document.getElementById('remove-asset-code').value.trim();
      if (!assetCode) return;

      showLoading();
      try {
        const response = await api.getAssetByCode(assetCode);
        if (response.success && response.data) {
          retrievedAsset = response.data;
          renderRemoveAssetInfo(retrievedAsset);
          showRemoveStage(2);
        } else {
          showNotification(response.message || 'Asset not found with the provided Asset Code', 'error');
        }
      } catch (error) {
        console.error('Error fetching asset for removal:', error);
        showNotification('Failed to fetch asset information. Please try again.', 'error');
      } finally {
        hideLoading();
      }
    });
  }

  if (stage2BackBtn) stage2BackBtn.addEventListener('click', () => showRemoveStage(1));
  if (stage2DeleteBtn) stage2DeleteBtn.addEventListener('click', () => showRemoveStage(3));
  if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', () => showRemoveStage(2));

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!retrievedAsset) {
        showNotification('No asset selected. Please start over.', 'error');
        return;
      }

      showLoading();
      try {
        const response = await api.deleteAsset(retrievedAsset.assetCode);
        if (response.success) {
          showNotification(response.message, 'success');
          closeModal();
          await handleDashboardPage();
          if (window.currentAssetContext) {
            await loadAssetsData(window.currentAssetContext.assetType, window.currentAssetContext.department);
          }
        } else {
          showNotification(response.message, 'error');
          showRemoveStage(2);
        }
      } catch (error) {
        console.error('Delete asset error:', error);
        showNotification('Failed to remove asset. Please try again.', 'error');
        showRemoveStage(2);
      } finally {
        hideLoading();
      }
    });
  }
}

function renderRemoveAssetInfo(asset) {
  const container = document.getElementById('remove-asset-info-display');
  if (!container) return;

  const displayVal = (v) => v || '-';
  const rows = [
    { label: 'Asset Type', value: asset.assetType },
    { label: 'Department', value: asset.department },
    { label: 'Username', value: displayVal(asset.username) },
    { label: 'Asset Code', value: asset.assetCode },
    { label: 'Hostname', value: displayVal(asset.hostname) },
    { label: 'SSD', value: displayVal(asset.ssd) },
    { label: 'RAM', value: displayVal(asset.ram) },
    { label: 'Processor', value: displayVal(asset.processor) },
    { label: 'Serial Number', value: asset.serialNumber },
    { label: 'Status', value: asset.status || '-' }
  ];

  container.innerHTML = rows.map(row => `
    <div class="asset-info-row">
      <span class="asset-info-label">${escapeHtml(row.label)}</span>
      <span class="asset-info-value">${escapeHtml(row.value)}</span>
    </div>
  `).join('');
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  const messageEl = document.getElementById('notification-message');
  if (!notification || !messageEl) return;

  notification.className = `notification ${type}`;
  messageEl.textContent = message;
  notification.classList.remove('hidden');

  setTimeout(() => {
    notification.classList.add('hidden');
  }, 4000);
}
