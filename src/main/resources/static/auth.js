/* ========================================
   AUTH.JS — Login, Register, JWT management
   Calls /api/auth/login & /api/auth/register
   ======================================== */

/* eslint-env browser */
/* global API_BASE, showToast, Dashboard */
/* exported Auth */

const Auth = (function () {
    const TOKEN_KEY = 'sniplink-token';
    const EMAIL_KEY = 'sniplink-email';

    // --- DOM refs ---
    const overlay = document.getElementById('auth-overlay');
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('modal-close');
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userEmail = document.getElementById('user-email');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');

    // --- Modal open/close ---
    function openModal(tab = 'login') {
        overlay.classList.remove('hidden');
        switchTab(tab);
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
        loginForm.reset();
        registerForm.reset();
    }

    // Close on overlay click (not modal itself)
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeModal();
    });

    closeBtn.addEventListener('click', closeModal);
    loginBtn.addEventListener('click', () => openModal('login'));
    registerBtn.addEventListener('click', () => openModal('register'));
    switchToRegister.addEventListener('click', (e) => { e.preventDefault(); switchTab('register'); });
    switchToLogin.addEventListener('click', (e) => { e.preventDefault(); switchTab('login'); });

    // Mobile auth links (inside hamburger menu)
    const mobileLoginLink = document.getElementById('mobile-login-link');
    const mobileRegisterLink = document.getElementById('mobile-register-link');
    if (mobileLoginLink) {
        mobileLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Close hamburger menu
            const hamburger = document.getElementById('hamburger');
            const navLinksEl = document.getElementById('nav-links');
            if (hamburger) hamburger.classList.remove('open');
            if (navLinksEl) navLinksEl.classList.remove('open');
            openModal('login');
        });
    }
    if (mobileRegisterLink) {
        mobileRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            const hamburger = document.getElementById('hamburger');
            const navLinksEl = document.getElementById('nav-links');
            if (hamburger) hamburger.classList.remove('open');
            if (navLinksEl) navLinksEl.classList.remove('open');
            openModal('register');
        });
    }

    // --- Tab switching ---
    function switchTab(tab) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        loginForm.classList.toggle('hidden', tab !== 'login');
        registerForm.classList.toggle('hidden', tab !== 'register');
    }

    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

    // --- Login ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) return;

        const btn = document.getElementById('login-submit');
        const loader = document.getElementById('login-loader');
        setFormLoading(btn, loader, true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Login failed');
            }

            const data = await res.json();
            saveSession(data.token, email);
            closeModal();
            showToast('Welcome back!', 'success');
        } catch (err) {
            showToast(err.message || 'Login failed', 'error');
        } finally {
            setFormLoading(btn, loader, false);
        }
    });

    // --- Register ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (!email || !password) return;

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirm) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const btn = document.getElementById('register-submit');
        const loader = document.getElementById('register-loader');
        setFormLoading(btn, loader, true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg || 'Registration failed');
            }

            const data = await res.json();
            saveSession(data.token, email);
            closeModal();
            showToast('Account created!', 'success');
        } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
        } finally {
            setFormLoading(btn, loader, false);
        }
    });

    // --- Logout ---
    logoutBtn.addEventListener('click', () => {
        clearSession();
        showToast('Logged out', 'success');
    });

    // --- Session management ---
    function saveSession(token, email) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(EMAIL_KEY, email);
        updateUI(email);
        if (typeof Dashboard !== 'undefined') Dashboard.refresh();
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        updateUI(null);
        if (typeof Dashboard !== 'undefined') Dashboard.refresh();
    }

    function updateUI(email) {
        const mobileAuthDiv = document.querySelector('.mobile-auth-links');
        if (email) {
            authButtons.classList.add('hidden');
            userInfo.classList.remove('hidden');
            userEmail.textContent = email;
            userAvatar.textContent = email.charAt(0).toUpperCase();
            if (mobileAuthDiv) mobileAuthDiv.style.display = 'none';
        } else {
            authButtons.classList.remove('hidden');
            userInfo.classList.add('hidden');
            userEmail.textContent = '';
            userAvatar.textContent = '';
            if (mobileAuthDiv) mobileAuthDiv.style.display = '';
        }
    }

    function setFormLoading(btn, loader, loading) {
        btn.disabled = loading;
        const text = btn.querySelector('.btn-text');
        if (loading) {
            text.style.visibility = 'hidden';
            loader.classList.remove('hidden');
        } else {
            text.style.visibility = 'visible';
            loader.classList.add('hidden');
        }
    }

    // --- Public API ---
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function isLoggedIn() {
        const token = getToken();
        if (!token) return false;

        try {
            // Check expiry by decoding JWT payload
            const payloadBase64 = token.split('.')[1];
            // Fix base64url to base64
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(atob(base64));
            
            // Check if token is expired (exp is in seconds)
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                clearSession();
                return false;
            }
            return true;
        } catch (e) {
            clearSession();
            return false;
        }
    }

    // --- Init: restore session ---
    const savedEmail = localStorage.getItem(EMAIL_KEY);
    if (savedEmail && isLoggedIn()) {
        updateUI(savedEmail);
    }

    return { getToken, isLoggedIn, openModal };
})();
