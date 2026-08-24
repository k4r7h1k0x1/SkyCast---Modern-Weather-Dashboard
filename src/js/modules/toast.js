let container = null;

const ICONS = {
  info: 'fa-circle-info',
  error: 'fa-triangle-exclamation',
  success: 'fa-circle-check',
};

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function showToast(message, { type = 'info', duration = 4500 } = {}) {
  const root = ensureContainer();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${ICONS[type] ?? ICONS.info}" aria-hidden="true"></i>
    <span>${escapeHtml(message)}</span>
  `;
  root.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-visible'));
  });

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 250);
  };

  const timer = setTimeout(dismiss, duration);
  toast.addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}