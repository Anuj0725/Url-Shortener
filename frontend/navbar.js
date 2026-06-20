/* ========================================
   NAVBAR — Scroll effects, active tracking,
   mobile hamburger menu
   ======================================== */

(function () {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // --- Navbar background on scroll ---
    function handleScroll() {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveLink();
    }

    // --- Active link based on scroll position ---
    function updateActiveLink() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                link.classList.remove('active');
                if (href === '#' + current) {
                    link.classList.add('active');
                }
            }
        });
    }

    // --- Mobile hamburger toggle ---
    function toggleMenu() {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    }

    function closeMenu() {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
    }

    // Close mobile menu when a nav link is clicked
    links.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
            closeMenu();
        }
    });

    // --- Event listeners ---
    window.addEventListener('scroll', handleScroll, { passive: true });
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Init
    handleScroll();
})();
