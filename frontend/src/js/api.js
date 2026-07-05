const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  async getAllAssets() { return fetchAPI('/assets'); },
  async getAssetsByType(assetType) { return fetchAPI(`/assets/type/${encodeURIComponent(assetType)}`); },
  async getAssetsByDepartment(department) { return fetchAPI(`/assets/department/${encodeURIComponent(department)}`); },
  async getAssetsByTypeAndDepartment(assetType, department) {
    return fetchAPI(`/assets/type/${encodeURIComponent(assetType)}/department/${encodeURIComponent(department)}`);
  },
  async searchAssets(params = {}) {
    const queryParts = [];
    if (params.searchTerm) queryParts.push(`q=${encodeURIComponent(params.searchTerm)}`);
    if (params.assetType) queryParts.push(`assetType=${encodeURIComponent(params.assetType)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.status && params.status !== 'All') queryParts.push(`status=${encodeURIComponent(params.status)}`);
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return fetchAPI(`/assets/search${queryString}`);
  },
  async getDepartmentsByAssetType(assetType) { return fetchAPI(`/departments/${encodeURIComponent(assetType)}`); },
  async getStats() { return fetchAPI('/assets/stats'); },
  async globalSearch(searchTerm) {
    if (!searchTerm) return { success: true, data: [], count: 0 };
    return fetchAPI(`/assets/global-search?q=${encodeURIComponent(searchTerm)}`);
  },
  async issueAsset(data) {
    return fetchAPI('/issues', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async reissueAsset(data) {
    return fetchAPI('/issues/reissue', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  getDownloadUrl(params = {}) {
    const queryParts = [];
    if (params.searchTerm) queryParts.push(`q=${encodeURIComponent(params.searchTerm)}`);
    if (params.assetType) queryParts.push(`assetType=${encodeURIComponent(params.assetType)}`);
    if (params.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
    if (params.status && params.status !== 'All') queryParts.push(`status=${encodeURIComponent(params.status)}`);
    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return `${API_BASE_URL}/assets/download/csv${queryString}`;
  }
};
