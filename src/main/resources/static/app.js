/* ========================================
   APP.JS — URL Shortener logic
   Handles /api/shorten and /api/shorten/custom
   ======================================== */

/* eslint-env browser */
/* global Auth, Dashboard, showToast */

// Use relative path if hosted on the same server (Spring Boot), otherwise fallback to localhost:8080
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:8080' 
    : '';

(function () {
    const form = document.getElementById('shorten-form');
    const longUrlInput = document.getElementById('long-url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const btnText = shortenBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('shorten-loader');
    const expiryInput = document.getElementById('expiry-input');
    const aliasInput = document.getElementById('alias-input');
    const resultBox = document.getElementById('result-box');
    const resultLink = document.getElementById('result-link');
    const resultOriginal = document.getElementById('result-original');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // --- Form submit ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const longUrl = longUrlInput.value.trim();
        if (!longUrl) return;

        // Check if custom alias is provided
        const customAlias = aliasInput.value.trim();
        const useCustomAlias = !!customAlias;

        // Validate alias if provided
        if (useCustomAlias) {
            if (!/^[a-zA-Z0-9_-]{3,50}$/.test(customAlias)) {
                showToast('Alias: 3–50 chars, letters, numbers, hyphens, underscores only', 'error');
                aliasInput.focus();
                return;
            }
        }

        // Build expiry
        let expiryDays = null;
        if (expiryInput.value.trim() !== '') {
            const days = parseInt(expiryInput.value, 10);
            if (isNaN(days) || days < 1 || days > 365) {
                showToast('Expiry must be between 1 and 365 days', 'error');
                return;
            }
            expiryDays = days;
        }

        // Loading state
        setLoading(true);
        resultBox.classList.add('hidden');

        try {
            let endpoint, body;

            if (useCustomAlias) {
                endpoint = `${API_BASE}/api/shorten/custom`;
                body = { longUrl, customAlias, expiryDays };
            } else {
                endpoint = `${API_BASE}/api/shorten`;
                body = { longUrl, expiryDays };
            }

            const headers = { 'Content-Type': 'application/json' };
            if (Auth.isLoggedIn()) {
                headers['Authorization'] = `Bearer ${Auth.getToken()}`;
            }

            const res = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errMsg = await res.text();
                throw new Error(errMsg || 'Failed to shorten URL');
            }

            const data = await res.json();

            // Show result
            resultLink.href = data.shortUrl;
            resultLink.textContent = data.shortUrl;
            resultOriginal.textContent = `Original: ${data.longUrl}`;
            resultBox.classList.remove('hidden');
            resetCopyBtn();

            showToast('URL shortened successfully!', 'success');
            if (Auth.isLoggedIn() && typeof Dashboard !== 'undefined') Dashboard.refresh();
            if (typeof refreshPlatformStats === 'function') refreshPlatformStats();
        } catch (err) {
            showToast(err.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    });

    // --- Copy to clipboard ---
    copyBtn.addEventListener('click', async () => {
        const url = resultLink.textContent;
        try {
            await navigator.clipboard.writeText(url);
            copyText.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            showToast('Copied to clipboard!', 'success');
            setTimeout(resetCopyBtn, 2000);
        } catch {
            showToast('Failed to copy', 'error');
        }
    });

    // --- Helpers ---
    function setLoading(loading) {
        shortenBtn.disabled = loading;
        btnText.textContent = loading ? '' : 'Shorten URL';
        btnLoader.classList.toggle('hidden', !loading);
    }

    function resetCopyBtn() {
        copyText.textContent = 'Copy';
        copyBtn.classList.remove('copied');
    }
})();

/* ========================================
   PLATFORM STATS — /api/stats/platform
   ======================================== */

(function () {
    const linksEl = document.getElementById('platform-links');
    const clicksEl = document.getElementById('platform-clicks');

    // Track running animation frame IDs so we can cancel before starting a new one
    const runningAnimations = new Map();

    async function loadPlatformStats() {
        try {
            const res = await fetch(`${API_BASE}/api/stats/platform`, {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error('Stats fetch failed: ' + res.status);

            const data = await res.json();
            const links = (data.linksCreated != null) ? Number(data.linksCreated) : 0;
            const clicks = (data.clickCount != null) ? Number(data.clickCount) : 0;

            animateCount(linksEl, links);
            animateCount(clicksEl, clicks);
        } catch (err) {
            console.error('Platform stats load error:', err);
            linksEl.textContent = '—';
            clicksEl.textContent = '—';
        }
    }

    // Animated count-up (cancels any previous animation on the same element)
    function animateCount(el, target) {
        // Cancel any running animation for this element
        const prevId = runningAnimations.get(el);
        if (prevId) {
            cancelAnimationFrame(prevId);
            runningAnimations.delete(el);
        }

        if (target === 0) { el.textContent = '0'; return; }

        const duration = 1200;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) {
                const id = requestAnimationFrame(tick);
                runningAnimations.set(el, id);
            } else {
                el.textContent = target.toLocaleString();
                runningAnimations.delete(el);
            }
        }

        const id = requestAnimationFrame(tick);
        runningAnimations.set(el, id);
    }

    // Load on page ready
    loadPlatformStats();

    // Expose for refresh after shortening, login, logout, etc.
    window.refreshPlatformStats = loadPlatformStats;
})();
