export function getStatusClass(status) {
  const map = {
    'Functional': 'status-functional',
    'Need Replacement': 'status-need-replacement',
    'Not Functional': 'status-not-functional'
  };
  return map[status] || '';
}

export function showLoading() {
  document.getElementById('loading-overlay')?.classList.remove('hidden');
}

export function hideLoading() {
  document.getElementById('loading-overlay')?.classList.add('hidden');
}

export function showNotification(message, type = 'success') {
  const el = document.getElementById('notification');
  const msgEl = document.getElementById('notification-message');
  if (!el || !msgEl) return;
  msgEl.textContent = message;
  el.className = `notification ${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3500);
}

export function getUsername() {
  try {
    return localStorage.getItem('emami-username') || 'User';
  } catch { return 'User'; }
}
