const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

export const api = {
  async getAllAssets() { return fetchAPI('/assets'); },
  async createAsset(data) { return fetchAPI('/assets', { method: 'POST', body: JSON.stringify(data) }); },
  async getAssetByCode(assetCode) { return fetchAPI(`/assets/code/${encodeURIComponent(assetCode)}`); },
  async deleteAsset(assetCode) { return fetchAPI(`/assets/code/${encodeURIComponent(assetCode)}`, { method: 'DELETE' }); },
  async getAssetsByType(assetType) { return fetchAPI(`/assets/type/${encodeURIComponent(assetType)}`); },
  async getAssetsByDepartment(department) { return fetchAPI(`/assets/department/${encodeURIComponent(department)}`); },
  async getAssetsByTypeAndDepartment(assetType, department) {
    return fetchAPI(`/assets/type/${encodeURIComponent(assetType)}/department/${encodeURIComponent(department)}`);
  },
  async searchAssets(params = {}) {
    const q = new URLSearchParams();
    if (params.searchTerm) q.set('q', params.searchTerm);
    if (params.assetType) q.set('assetType', params.assetType);
    if (params.department) q.set('department', params.department);
    if (params.status && params.status !== 'All') q.set('status', params.status);
    const qs = q.toString();
    return fetchAPI(`/assets/search${qs ? '?' + qs : ''}`);
  },
  async getDepartmentCountsByAssetType(assetType) {
    return fetchAPI(`/assets/type/${encodeURIComponent(assetType)}/department-counts`);
  },
  async getStats() { return fetchAPI('/assets/stats'); },
  async globalSearch(searchTerm) {
    if (!searchTerm) return { success: true, data: [], count: 0 };
    return fetchAPI(`/assets/global-search?q=${encodeURIComponent(searchTerm)}`);
  },
  async submitAsset(data) { return fetchAPI('/submits', { method: 'POST', body: JSON.stringify(data) }); },
  async reissueAsset(data) { return fetchAPI('/submits/reissue', { method: 'POST', body: JSON.stringify(data) }); },
  getDownloadUrl(params = {}) {
    const q = new URLSearchParams();
    if (params.searchTerm) q.set('q', params.searchTerm);
    if (params.assetType) q.set('assetType', params.assetType);
    if (params.department) q.set('department', params.department);
    if (params.status && params.status !== 'All') q.set('status', params.status);
    const qs = q.toString();
    return `${API_BASE_URL}/assets/download/csv${qs ? '?' + qs : ''}`;
  },
  getDownloadAllUrl() { return `${API_BASE_URL}/assets/download/all`; }
};
