/**
 * Wires the "/" keyboard shortcut to focus the search input, matching the
 * convention used by many modern apps (GitHub, Slack, etc.).So it
 * never hijacks a literal "/" character mid-search or in any other field.
 */
export function initSearchShortcut(searchInputSelector = '#search-input') {
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/') return;

    const active = document.activeElement;
    const isTyping = active
      && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (isTyping) return;

    event.preventDefault();
    document.querySelector(searchInputSelector)?.focus();
  });
}