export function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), wait);
  };
}

export function throttle(callback, wait) {
  let lastRun = 0;
  let timeoutId;
  return (...args) => {
    const remaining = wait - (Date.now() - lastRun);
    if (remaining <= 0) {
      clearTimeout(timeoutId);
      lastRun = Date.now();
      callback(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastRun = Date.now();
        timeoutId = null;
        callback(...args);
      }, remaining);
    }
  };
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
