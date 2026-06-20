/* ========================================
   APP.JS — URL Shortener logic
   Handles /api/shorten and /api/shorten/custom
   ======================================== */

const API_BASE = 'http://localhost:8080';

(function () {
    const form = document.getElementById('shorten-form');
    const longUrlInput = document.getElementById('long-url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const btnText = shortenBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('shorten-loader');
    const expiryToggle = document.getElementById('expiry-toggle');
    const expiryWrap = document.getElementById('expiry-wrap');
    const expiryInput = document.getElementById('expiry-input');
    const aliasToggle = document.getElementById('alias-toggle');
    const aliasWrap = document.getElementById('alias-wrap');
    const aliasInput = document.getElementById('alias-input');
    const resultBox = document.getElementById('result-box');
    const resultLink = document.getElementById('result-link');
    const resultOriginal = document.getElementById('result-original');
    const copyBtn = document.getElementById('copy-btn');
    const copyText = document.getElementById('copy-text');

    // --- Expiry toggle ---
    expiryToggle.addEventListener('change', () => {
        expiryWrap.classList.toggle('hidden', !expiryToggle.checked);
    });

    // --- Alias toggle ---
    aliasToggle.addEventListener('change', () => {
        aliasWrap.classList.toggle('hidden', !aliasToggle.checked);
        if (aliasToggle.checked) {
            aliasInput.focus();
        }
    });

    // --- Form submit ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const longUrl = longUrlInput.value.trim();
        if (!longUrl) return;

        // Check if custom alias is enabled
        const useCustomAlias = aliasToggle.checked;
        const customAlias = aliasInput.value.trim();

        // Validate alias if enabled
        if (useCustomAlias) {
            if (!customAlias) {
                showToast('Please enter a custom alias', 'error');
                aliasInput.focus();
                return;
            }
            if (!/^[a-zA-Z0-9_-]{3,50}$/.test(customAlias)) {
                showToast('Alias: 3–50 chars, letters, numbers, hyphens, underscores only', 'error');
                aliasInput.focus();
                return;
            }
        }

        // Build expiry
        let expiryDays = null;
        if (expiryToggle.checked) {
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
        btnText.textContent = loading ? '' : 'Shorten';
        btnLoader.classList.toggle('hidden', !loading);
    }

    function resetCopyBtn() {
        copyText.textContent = 'Copy';
        copyBtn.classList.remove('copied');
    }
})();
