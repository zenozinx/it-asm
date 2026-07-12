let searchTimeout = null;

export function initSearch(onSearch) {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        onSearch({ searchTerm: e.target.value.trim(), status: statusFilter?.value || 'All' });
      }, 300);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        onSearch({ searchTerm: searchInput.value.trim(), status: statusFilter?.value || 'All' });
      }
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      onSearch({ searchTerm: searchInput?.value.trim() || '', status: statusFilter.value });
    });
  }
}

export function clearSearch() {
  const searchInput = document.getElementById('search-input');
  const statusFilter = document.getElementById('status-filter');
  if (searchInput) searchInput.value = '';
  if (statusFilter) statusFilter.value = 'All';
}

export function getSearchValues() {
  return {
    searchTerm: document.getElementById('search-input')?.value.trim() || '',
    status: document.getElementById('status-filter')?.value || 'All'
  };
}
