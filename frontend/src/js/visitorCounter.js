const VISITOR_KEY = 'emami-visitors';
const VISIT_TIMESTAMP_KEY = 'emami-last-visit';

export function initVisitorCounter() {
  const visitorCountEl = document.getElementById('visitor-count');
  if (!visitorCountEl) return;

  const storedCount = parseInt(localStorage.getItem(VISITOR_KEY) || '0', 10);
  const lastVisit = localStorage.getItem(VISIT_TIMESTAMP_KEY);
  const now = Date.now();

  let newCount = storedCount;
  if (!lastVisit || (now - parseInt(lastVisit, 10)) > 300000) {
    newCount = storedCount + 1;
    localStorage.setItem(VISITOR_KEY, newCount.toString());
    localStorage.setItem(VISIT_TIMESTAMP_KEY, now.toString());
  }

  animateCounter(visitorCountEl, newCount);
}

function animateCounter(element, targetValue) {
  const duration = 1000;
  const startValue = parseInt(element.textContent) || 0;
  const startTime = performance.now();

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
    element.textContent = formatNumber(currentValue);
    if (progress < 1) requestAnimationFrame(updateCounter);
  }

  requestAnimationFrame(updateCounter);
}

function formatNumber(num) { return num.toLocaleString(); }
export function getVisitorCount() { return parseInt(localStorage.getItem(VISITOR_KEY) || '0', 10); }
