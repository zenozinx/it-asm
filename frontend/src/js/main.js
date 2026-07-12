import { api } from './api.js';
import { showLoading, hideLoading, showNotification, getStatusClass, getUsername } from './utilities.js';
import { initSearch, clearSearch, getSearchValues } from './search.js';
import { initDownload, initDownloadAllBtn } from './download.js';

const DEPT_TYPES = ['Desktop', 'Laptop', 'Scanner', 'Printer'];
const MINIMAL_TYPES = ['Router', 'Switch', 'Firewall', 'IoT Devices'];
const DEPARTMENTS = ['Accounts', 'Finance', 'HR', 'IT', 'Production', 'Marketing', 'Administration', 'Others'];

// Track current navigation context
window.currentAssetContext = {};

// ── Initialization ──────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initVisitorCounter();
  initLandingPage();
  initContactModal();
  initAssetCards();
  initDepartmentNavigation();
  initAssetsPage();
  initDownload();
  initDownloadAllBtn();
  initGlobalSearch();
  initAddAssetModal();
  initIssueModal();
  initReissueModal();
  initRemoveAssetModal();
});

// ── Theme ────────────────────────────────────────────────────────────────────

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('emami-theme');
  if (saved === 'dark') document.body.classList.add('dark');
  btn?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('emami-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
}

// ── Visitor Counter ──────────────────────────────────────────────────────────

function initVisitorCounter() {
  const el = document.getElementById('visitor-count');
  if (!el) return;
  let count = parseInt(localStorage.getItem('emami-visitors') || '0');
  count++;
  localStorage.setItem('emami-visitors', count);
  el.textContent = count;
}

// ── Landing Page ─────────────────────────────────────────────────────────────

function initLandingPage() {
  const username = getUsername();
  const display = document.getElementById('username-display');
  if (display) display.textContent = `Welcome, ${username}`;
  document.getElementById('enter-btn')?.addEventListener('click', () => {
    showPage('dashboard-page');
    loadDashboardStats();
  });
}

// ── Page Navigation ──────────────────────────────────────────────────────────

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(pageId)?.classList.remove('hidden');
}

// ── Contact Modal ─────────────────────────────────────────────────────────────

function initContactModal() {
  const btn = document.getElementById('contact-btn');
  const modal = document.getElementById('contact-modal');
  const close = document.getElementById('modal-close');
  btn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  close?.addEventListener('click', () => modal?.classList.add('hidden'));
  modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

async function loadDashboardStats() {
  try {
    const res = await api.getStats();
    if (!res.success) return;
    const stats = res.data;
    const idMap = {
      'Desktop': 'desktop-count',
      'Laptop': 'laptop-count',
      'Scanner': 'scanner-count',
      'Printer': 'printer-count',
      'Router': 'router-count',
      'Switch': 'switch-count',
      'Firewall': 'firewall-count',
      'IoT Devices': 'iot-count'
    };
    Object.entries(idMap).forEach(([type, id]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = `${stats.byType[type] || 0} Asset${stats.byType[type] !== 1 ? 's' : ''}`;
    });
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// ── Asset Cards (Dashboard) ───────────────────────────────────────────────────

function initAssetCards() {
  document.querySelectorAll('.asset-card').forEach(card => {
    card.addEventListener('click', () => {
      const assetType = card.dataset.assetType;
      if (!assetType) return;
      if (DEPT_TYPES.includes(assetType)) {
        navigateToDepartments(assetType);
      } else if (MINIMAL_TYPES.includes(assetType)) {
        navigateToMinimalAssets(assetType);
      }
    });
  });
}

// ── Departments Page ──────────────────────────────────────────────────────────

async function navigateToDepartments(assetType) {
  window.currentAssetContext = { assetType };
  const title = document.getElementById('department-title');
  if (title) title.textContent = `${assetType} - Departments`;
  showPage('departments-page');
  await renderDepartmentCards(assetType);
}

async function renderDepartmentCards(assetType) {
  const container = document.getElementById('department-cards');
  if (!container) return;

  container.innerHTML = '<p style="color:var(--text-muted);padding:24px;">Loading...</p>';

  let counts = {};
  try {
    const res = await api.getDepartmentCountsByAssetType(assetType);
    if (res.success) {
      res.data.forEach(({ department, count }) => { counts[department] = count; });
    }
  } catch (err) {
    console.error('Failed to load department counts:', err);
  }

  container.innerHTML = DEPARTMENTS.map(dept => {
    const count = counts[dept] || 0;
    return `
      <div class="department-card" data-department="${dept}">
        <div class="department-card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3>${dept}</h3>
        <p class="department-asset-count">${count} Asset${count !== 1 ? 's' : ''}</p>
      </div>
    `;
  }).join('');
}

function initDepartmentNavigation() {
  document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
    window.currentAssetContext = {};
    showPage('dashboard-page');
  });

  document.getElementById('department-cards')?.addEventListener('click', async (e) => {
    const card = e.target.closest('.department-card');
    if (!card) return;
    const department = card.dataset.department;
    const assetType = window.currentAssetContext.assetType;
    if (!assetType || !department) return;
    window.currentAssetContext.department = department;
    await navigateToAssets(assetType, department);
  });
}

// ── Assets Page ───────────────────────────────────────────────────────────────

async function navigateToMinimalAssets(assetType) {
  window.currentAssetContext = { assetType, department: null };
  const title = document.getElementById('assets-title');
  const subtitle = document.getElementById('assets-subtitle');
  if (title) title.textContent = `${assetType} - All Assets`;
  if (subtitle) subtitle.textContent = `Viewing all ${assetType} assets`;
  updateAssetsTableHeader(true);
  clearSearch();
  showPage('assets-page');
  await loadAssetsData(assetType, null, '', 'All');
}

async function navigateToAssets(assetType, department) {
  const title = document.getElementById('assets-title');
  const subtitle = document.getElementById('assets-subtitle');
  if (title) title.textContent = `${assetType} - ${department}`;
  if (subtitle) subtitle.textContent = `Viewing ${assetType} assets for ${department} department`;
  updateAssetsTableHeader(false);
  clearSearch();
  showPage('assets-page');
  await loadAssetsData(assetType, department, '', 'All');
}

function updateAssetsTableHeader(isMinimal) {
  const row = document.getElementById('assets-table-head-row');
  if (!row) return;
  const cols = isMinimal
    ? ['Username', 'Asset Code', 'Hostname', 'SSD', 'RAM', 'Processor', 'Serial Number', 'Location', 'Status']
    : ['Username', 'Asset Code', 'Hostname', 'SSD', 'RAM', 'Processor', 'Serial Number', 'Status'];
  row.innerHTML = cols.map(c => `<th>${c}</th>`).join('');
}

async function loadAssetsData(assetType, department, searchTerm, status) {
  showLoading();
  try {
    const params = { assetType, status };
    if (department) params.department = department;
    if (searchTerm) params.searchTerm = searchTerm;
    const res = await api.searchAssets(params);
    const assets = res.success ? res.data : [];
    renderAssetsTable(assets, MINIMAL_TYPES.includes(assetType));
  } catch (err) {
    showNotification('Failed to load assets.', 'error');
  } finally {
    hideLoading();
  }
}

function renderAssetsTable(assets, isMinimal) {
  const tbody = document.getElementById('assets-tbody');
  const countEl = document.getElementById('table-count');
  if (!tbody) return;

  if (assets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isMinimal ? 9 : 8}" style="text-align:center;padding:40px;color:var(--text-muted);">No assets found</td></tr>`;
    if (countEl) countEl.textContent = 'Showing 0 assets';
    return;
  }

  tbody.innerHTML = assets.map(a => {
    const statusClass = getStatusClass(a.status);
    const cells = isMinimal
      ? [a.username, a.assetCode, a.hostname, a.ssd, a.ram, a.processor, a.serialNumber, a.location, a.status]
      : [a.username, a.assetCode, a.hostname, a.ssd, a.ram, a.processor, a.serialNumber, a.status];
    return `<tr>${cells.map((cell, i) => {
      const isStatus = (isMinimal && i === 8) || (!isMinimal && i === 7);
      return isStatus
        ? `<td><span class="status-badge ${statusClass}">${cell || ''}</span></td>`
        : `<td>${cell || ''}</td>`;
    }).join('')}</tr>`;
  }).join('');

  if (countEl) countEl.textContent = `Showing ${assets.length} asset${assets.length !== 1 ? 's' : ''}`;
}

function initAssetsPage() {
  // Back button on assets page
  document.getElementById('back-to-departments')?.addEventListener('click', () => {
    const ctx = window.currentAssetContext;
    if (MINIMAL_TYPES.includes(ctx.assetType)) {
      showPage('dashboard-page');
      window.currentAssetContext = {};
    } else {
      showPage('departments-page');
    }
  });

  // View Data button
  document.getElementById('view-data-btn')?.addEventListener('click', async () => {
    const ctx = window.currentAssetContext;
    const { searchTerm, status } = getSearchValues();
    await loadAssetsData(ctx.assetType, ctx.department || null, searchTerm, status);
  });

  // Search & filter
  initSearch(async ({ searchTerm, status }) => {
    const ctx = window.currentAssetContext;
    await loadAssetsData(ctx.assetType, ctx.department || null, searchTerm, status);
  });
}

// ── Global Search ─────────────────────────────────────────────────────────────

function initGlobalSearch() {
  const input = document.getElementById('global-search-input');
  const btn = document.getElementById('global-search-btn');
  const results = document.getElementById('global-search-results');

  const doSearch = async () => {
    const term = input?.value.trim();
    if (!term) return;
    showLoading();
    try {
      const res = await api.globalSearch(term);
      const assets = res.success ? res.data : [];
      renderGlobalResults(assets);
      results?.classList.remove('hidden');
    } catch {
      showNotification('Search failed.', 'error');
    } finally {
      hideLoading();
    }
  };

  btn?.addEventListener('click', doSearch);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
}

function renderGlobalResults(assets) {
  const tbody = document.getElementById('global-search-tbody');
  if (!tbody) return;
  if (assets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No results found</td></tr>`;
    return;
  }
  tbody.innerHTML = assets.map(a => {
    const statusClass = getStatusClass(a.status);
    return `<tr>
      <td>${a.assetType || ''}</td>
      <td>${a.department || '-'}</td>
      <td>${a.username || ''}</td>
      <td>${a.assetCode || ''}</td>
      <td>${a.serialNumber || ''}</td>
      <td><span class="status-badge ${statusClass}">${a.status || ''}</span></td>
    </tr>`;
  }).join('');
}

// ── Add Asset Modal ───────────────────────────────────────────────────────────

function initAddAssetModal() {
  const modal = document.getElementById('add-asset-modal');
  const openBtn = document.getElementById('add-asset-btn');
  const closeBtn = document.getElementById('add-asset-modal-close');
  const cancelBtn = document.getElementById('add-asset-cancel-btn');
  const form = document.getElementById('add-asset-form');
  const typeSelect = document.getElementById('add-asset-type');

  openBtn?.addEventListener('click', () => {
    form?.reset();
    hideAllAddAssetFields();
    modal?.classList.remove('hidden');
  });

  const closeModal = () => modal?.classList.add('hidden');
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  typeSelect?.addEventListener('change', () => toggleAddAssetFields(typeSelect.value));

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    showLoading();
    try {
      const res = await api.createAsset(data);
      if (!res.success) throw new Error(res.message);
      closeModal();
      showNotification('Asset added successfully!');
      loadDashboardStats();
      const ctx = window.currentAssetContext;
      if (ctx.assetType === data.assetType) {
        await loadAssetsData(ctx.assetType, ctx.department || null, '', 'All');
      }
    } catch (err) {
      showNotification(err.message || 'Failed to add asset.', 'error');
    } finally {
      hideLoading();
    }
  });
}

function hideAllAddAssetFields() {
  ['add-asset-department-group', 'add-username-group', 'add-hostname-group',
   'add-ssd-group', 'add-ram-group', 'add-processor-group',
   'add-status-group', 'add-location-group'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function toggleAddAssetFields(assetType) {
  hideAllAddAssetFields();
  if (!assetType) return;

  const isDept = DEPT_TYPES.includes(assetType);
  const isMinimal = MINIMAL_TYPES.includes(assetType);

  // Fields common to both types
  ['add-username-group', 'add-hostname-group', 'add-ssd-group',
   'add-ram-group', 'add-processor-group', 'add-status-group'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  });

  // Department only for DEPT types
  const deptEl = document.getElementById('add-asset-department-group');
  if (deptEl) deptEl.style.display = isDept ? '' : 'none';

  // Location only for MINIMAL types
  const locEl = document.getElementById('add-location-group');
  if (locEl) locEl.style.display = isMinimal ? '' : 'none';
}

// ── Submit Asset (Issue) Modal ────────────────────────────────────────────────

function initIssueModal() {
  const modal = document.getElementById('issue-modal');
  const openBtn = document.getElementById('issue-asset-btn');
  const closeBtn = document.getElementById('issue-modal-close');

  let foundAsset = null;

  const closeModal = () => {
    modal?.classList.add('hidden');
    resetIssueStages();
    foundAsset = null;
  };

  openBtn?.addEventListener('click', () => modal?.classList.remove('hidden'));
  closeBtn?.addEventListener('click', closeModal);
  document.getElementById('issue-cancel-btn')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('issue-stage1-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('issue-asset-code')?.value.trim();
    if (!code) return;
    showLoading();
    try {
      const res = await api.getAssetByCode(code);
      if (!res.success || !res.data) throw new Error('Asset not found');
      foundAsset = res.data;
      renderAssetInfoDisplay('asset-info-display', foundAsset);
      setIssueStage(2);
    } catch (err) {
      showNotification(err.message || 'Asset not found.', 'error');
    } finally {
      hideLoading();
    }
  });

  document.getElementById('issue-stage2-back-btn')?.addEventListener('click', () => setIssueStage(1));
  document.getElementById('issue-stage2-next-btn')?.addEventListener('click', () => setIssueStage(3));
  document.getElementById('issue-stage3-back-btn')?.addEventListener('click', () => setIssueStage(2));

  document.getElementById('issue-stage3-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const desc = document.getElementById('issue-description')?.value.trim();
    if (!foundAsset || !desc) return;
    showLoading();
    try {
      await api.submitAsset({ assetCode: foundAsset.assetCode, issueDescription: desc });
      closeModal();
      showNotification('Asset issue submitted successfully!');
    } catch {
      showNotification('Failed to submit issue.', 'error');
    } finally {
      hideLoading();
    }
  });
}

function setIssueStage(stage) {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`issue-stage-${n}`);
    if (el) el.classList.toggle('hidden', n !== stage);
  });
}

function resetIssueStages() {
  setIssueStage(1);
  document.getElementById('issue-asset-code')?.value && (document.getElementById('issue-asset-code').value = '');
  document.getElementById('issue-description')?.value && (document.getElementById('issue-description').value = '');
}

// ── Reissue Modal ─────────────────────────────────────────────────────────────

function initReissueModal() {
  const modal = document.getElementById('reissue-modal');
  const closeModal = () => { modal?.classList.add('hidden'); document.getElementById('reissue-form')?.reset(); };

  document.getElementById('reissue-asset-btn')?.addEventListener('click', () => modal?.classList.remove('hidden'));
  document.getElementById('reissue-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('reissue-cancel-btn')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('reissue-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    showLoading();
    try {
      const res = await api.reissueAsset(data);
      if (!res.success) throw new Error(res.message);
      closeModal();
      showNotification('Asset reissued successfully!');
    } catch (err) {
      showNotification(err.message || 'Failed to reissue asset.', 'error');
    } finally {
      hideLoading();
    }
  });
}

// ── Remove Asset Modal ────────────────────────────────────────────────────────

function initRemoveAssetModal() {
  const modal = document.getElementById('remove-asset-modal');
  let foundAsset = null;

  const closeModal = () => {
    modal?.classList.add('hidden');
    resetRemoveStages();
    foundAsset = null;
  };

  document.getElementById('remove-asset-btn')?.addEventListener('click', () => modal?.classList.remove('hidden'));
  document.getElementById('remove-asset-modal-close')?.addEventListener('click', closeModal);
  document.getElementById('remove-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('remove-confirm-cancel-btn')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('remove-stage1-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = document.getElementById('remove-asset-code')?.value.trim();
    if (!code) return;
    showLoading();
    try {
      const res = await api.getAssetByCode(code);
      if (!res.success || !res.data) throw new Error('Asset not found');
      foundAsset = res.data;
      renderAssetInfoDisplay('remove-asset-info-display', foundAsset);
      setRemoveStage(2);
    } catch (err) {
      showNotification(err.message || 'Asset not found.', 'error');
    } finally {
      hideLoading();
    }
  });

  document.getElementById('remove-stage2-back-btn')?.addEventListener('click', () => setRemoveStage(1));
  document.getElementById('remove-stage2-delete-btn')?.addEventListener('click', () => setRemoveStage(3));
  document.getElementById('remove-confirm-delete-btn')?.addEventListener('click', async () => {
    if (!foundAsset) return;
    showLoading();
    try {
      await api.deleteAsset(foundAsset.assetCode);
      closeModal();
      showNotification('Asset removed successfully!');
      loadDashboardStats();
      const ctx = window.currentAssetContext;
      if (ctx.assetType === foundAsset.assetType) {
        await loadAssetsData(ctx.assetType, ctx.department || null, '', 'All');
        if (DEPT_TYPES.includes(foundAsset.assetType) && ctx.department) {
          await renderDepartmentCards(foundAsset.assetType);
        }
      }
    } catch {
      showNotification('Failed to remove asset.', 'error');
    } finally {
      hideLoading();
    }
  });
}

function setRemoveStage(stage) {
  [1, 2, 3].forEach(n => {
    const el = document.getElementById(`remove-stage-${n}`);
    if (el) el.classList.toggle('hidden', n !== stage);
  });
}

function resetRemoveStages() {
  setRemoveStage(1);
  const codeEl = document.getElementById('remove-asset-code');
  if (codeEl) codeEl.value = '';
}

// ── Shared Helpers ────────────────────────────────────────────────────────────

function renderAssetInfoDisplay(containerId, asset) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const fields = [
    ['Asset Type', asset.assetType],
    ['Asset Code', asset.assetCode],
    ['Username', asset.username],
    ['Hostname', asset.hostname],
    ['Serial Number', asset.serialNumber],
    ['Status', asset.status],
    ['Department', asset.department || '-'],
    ['Location', asset.location || '-']
  ];
  container.innerHTML = fields.map(([label, val]) => `
    <div class="asset-info-row">
      <span class="asset-info-label">${label}</span>
      <span class="asset-info-value">${val || '-'}</span>
    </div>
  `).join('');
}
