let container = null;

const ICONS = {
  info: 'fa-circle-info',
  warning: 'fa-triangle-exclamation',
  error: 'fa-circle-exclamation',
  success: 'fa-circle-check',
};

function getContainer() {
  if (container) return container;

  container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function showToast(message, { type = 'info', duration = 4500 } = {}) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `
    <i class="fa-solid ${ICONS[type] ?? ICONS.info}" aria-hidden="true"></i>
    <span>${escapeHtml(message)}</span>
  `;

  getContainer().appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('toast-visible'));
  });

  const dismiss = () => {
    el.classList.remove('toast-visible');
    setTimeout(() => el.remove(), 300);
  };

  const timer = setTimeout(dismiss, duration);
  el.addEventListener('click', () => {
    clearTimeout(timer);
    dismiss();
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}