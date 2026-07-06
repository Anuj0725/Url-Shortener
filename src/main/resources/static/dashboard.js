/* ========================================
   DASHBOARD.JS — My Links + Per-URL Analytics
   Fetches /my-links and /api/stats/{shortCode}
   ======================================== */

/* eslint-env browser */
/* global Auth, API_BASE, showToast */
/* exported Dashboard */

const Dashboard = (function () {
    const grid = document.getElementById('links-grid');
    const emptyState = document.getElementById('dashboard-empty');
    const noLinks = document.getElementById('no-links');
    const loader = document.getElementById('dashboard-loader');
    const dashboardLoginBtn = document.getElementById('dashboard-login-btn');

    // Stats modal refs
    const statsOverlay = document.getElementById('stats-overlay');
    const statsCloseBtn = document.getElementById('stats-modal-close');
    const statsLoader = document.getElementById('stats-modal-loader');
    const statsContent = document.getElementById('stats-content');
    const statsError = document.getElementById('stats-error');
    const statsErrorMsg = document.getElementById('stats-error-msg');
    const statsShortUrl = document.getElementById('stats-short-url');
    const statsLongUrl = document.getElementById('stats-long-url');
    const statClicks = document.getElementById('stat-clicks');
    const statStatus = document.getElementById('stat-status');
    const statExpiry = document.getElementById('stat-expiry');
    const statsCopyBtn = document.getElementById('stats-copy-btn');

    // Open auth modal from dashboard
    if (dashboardLoginBtn) {
        dashboardLoginBtn.addEventListener('click', () => Auth.openModal('login'));
    }

    // --- Stats modal open/close ---
    function openStatsModal() {
        statsOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeStatsModal() {
        statsOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    statsCloseBtn.addEventListener('click', closeStatsModal);
    statsOverlay.addEventListener('click', (e) => {
        if (e.target === statsOverlay) closeStatsModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !statsOverlay.classList.contains('hidden')) closeStatsModal();
    });

    // Copy in stats modal
    statsCopyBtn.addEventListener('click', async () => {
        const url = statsShortUrl.textContent;
        try {
            await navigator.clipboard.writeText(url);
            statsCopyBtn.textContent = 'Copied!';
            showToast('Copied!', 'success');
            setTimeout(() => { statsCopyBtn.textContent = 'Copy'; }, 2000);
        } catch {
            showToast('Failed to copy', 'error');
        }
    });

    // --- Fetch per-URL analytics ---
    async function viewStats(shortCode) {
        openStatsModal();
        setStatsState('loading');

        try {
            const res = await fetch(`${API_BASE}/api/stats/${encodeURIComponent(shortCode)}`, {
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` },
            });

            if (!res.ok) {
                const msg = await res.text();
                statsErrorMsg.textContent = msg || 'Failed to load analytics';
                setStatsState('error');
                return;
            }

            const data = await res.json();
            const shortUrl = `${API_BASE}/redirect/${data.shortCode}`;
            const isExpired = data.expiryTime && new Date(data.expiryTime) < new Date();
            const expiryDate = data.expiryTime
                ? new Date(data.expiryTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'No expiry set';

            statsShortUrl.href = shortUrl;
            statsShortUrl.textContent = shortUrl;
            statsLongUrl.textContent = data.longUrl;

            statClicks.textContent = data.clicksCount ?? 0;

            statStatus.textContent = isExpired ? 'Expired' : 'Active';
            statStatus.className = `stat-value ${isExpired ? 'expired-status' : 'active-status'}`;

            statExpiry.textContent = expiryDate;

            setStatsState('content');
        } catch (err) {
            statsErrorMsg.textContent = err.message;
            setStatsState('error');
        }
    }

    function setStatsState(state) {
        statsLoader.classList.toggle('hidden', state !== 'loading');
        statsContent.classList.toggle('hidden', state !== 'content');
        statsError.classList.toggle('hidden', state !== 'error');
    }

    // --- Fetch and render links ---
    async function loadLinks() {
        if (!Auth.isLoggedIn()) {
            showState('empty');
            return;
        }

        showState('loading');

        try {
            const res = await fetch(`${API_BASE}/my-links`, {
                headers: { 'Authorization': `Bearer ${Auth.getToken()}` },
            });

            if (!res.ok) {
                const msg = await res.text();
                showToast(msg || 'Failed to load links', 'error');
                grid.innerHTML = `<div class="stats-error"><p class="empty-title">Error</p><p class="empty-subtitle">${escapeHtml(msg) || 'Could not load your links'}</p></div>`;
                showState('grid');
                return;
            }

            const links = await res.json();

            if (!links || links.length === 0) {
                showState('no-links');
                return;
            }

            renderLinks(links);
            showState('grid');
        } catch (err) {
            showToast(err.message || 'Failed to load links', 'error');
            grid.innerHTML = `<div class="stats-error"><p class="empty-title">Error</p><p class="empty-subtitle">${escapeHtml(err.message) || 'Network error'}</p></div>`;
            showState('grid');
        }
    }

    // --- Render link cards ---
    function renderLinks(links) {
        grid.innerHTML = '';

        links.forEach((link, i) => {
            const isExpired = link.expiryTime && new Date(link.expiryTime) < new Date();
            const expiryDate = link.expiryTime
                ? new Date(link.expiryTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'No expiry';

            // Extract shortCode from the full short URL
            const shortCode = link.shortCode.includes('/')
                ? link.shortCode.split('/').pop()
                : link.shortCode;
            const fullShortUrl = `${API_BASE}/redirect/${shortCode}`;

            const card = document.createElement('div');
            card.className = 'link-card';
            card.style.animationDelay = `${i * 0.05}s`;
            card.style.cursor = 'pointer';

            card.innerHTML = `
                <div class="link-card-short">
                    <a href="${escapeHtml(fullShortUrl)}" target="_blank">${escapeHtml(fullShortUrl)}</a>
                    <button class="link-card-copy" data-url="${escapeHtml(fullShortUrl)}">Copy</button>
                </div>
                <div class="link-card-long" title="${escapeHtml(link.longUrl)}">${escapeHtml(link.longUrl)}</div>
                <div class="link-card-meta">
                    <span class="meta-chip clicks">👆 ${link.clicksCount ?? 0} clicks</span>
                    <span class="meta-chip ${isExpired ? 'expired' : 'active'}">
                        ${isExpired ? '⏰ Expired' : '📅 ' + expiryDate}
                    </span>
                    <span class="meta-chip">📊 View stats</span>
                </div>
            `;

            // Click card to view stats (but not on copy button or link)
            card.addEventListener('click', (e) => {
                if (e.target.closest('.link-card-copy') || e.target.closest('a')) return;
                viewStats(shortCode).catch(console.error);
            });

            grid.appendChild(card);
        });

        // Copy button handlers
        grid.querySelectorAll('.link-card-copy').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                try {
                    await navigator.clipboard.writeText(url);
                    btn.textContent = 'Copied!';
                    showToast('Copied!', 'success');
                    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
                } catch {
                    showToast('Failed to copy', 'error');
                }
            });
        });
    }

    // --- Show/hide states ---
    function showState(state) {
        emptyState.classList.toggle('hidden', state !== 'empty');
        grid.classList.toggle('hidden', state !== 'grid');
        loader.classList.toggle('hidden', state !== 'loading');
        noLinks.classList.toggle('hidden', state !== 'no-links');
    }

    // --- Escape HTML to prevent XSS ---
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // --- Auto-load on scroll into view ---
    let loaded = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && Auth.isLoggedIn() && !loaded) {
                loaded = true;
                loadLinks().catch(console.error);
            }
        });
    }, { threshold: 0.1 });

    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) observer.observe(dashboardSection);

    // --- Public API ---
    // noinspection JSUnusedGlobalSymbols
    return {
        loadLinks,
        refresh() {
            loaded = false;
            loadLinks().catch(console.error);
        }
    };
})();
