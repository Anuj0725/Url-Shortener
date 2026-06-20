/* ========================================
   THEME TOGGLE — Dark / Light
   Persists choice to localStorage
   ======================================== */

(function () {
    const STORAGE_KEY = 'sniplink-theme';
    const html = document.documentElement;
    const toggle = document.getElementById('theme-toggle');

    // Load saved theme (default: dark)
    function loadTheme() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
            html.setAttribute('data-theme', saved);
        }
    }

    // Toggle between dark and light
    function toggleTheme() {
        const current = html.getAttribute('data-theme') || 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_KEY, next);
    }

    // Init
    loadTheme();
    if (toggle) {
        toggle.addEventListener('click', toggleTheme);
    }
})();

/* ========================================
   TOAST UTILITY
   Usage: showToast('message', 'success' | 'error' | 'warning')
   ======================================== */

function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}
