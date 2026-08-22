/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — NAVIGATION & HEADER CONTROLLER
 * navigation.js
 * ═══════════════════════════════════════════════════════════════
 */

const NavigationModule = {
  init() {
    this.initStickyHeader();
    this.initMobileDrawer();
    this.highlightActiveLink();
  },

  /**
   * Add shadow/blur on scroll
   */
  initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  },

  /**
   * Open and close mobile drawer
   */
  initMobileDrawer() {
    const toggle = document.querySelector('.mobile-toggle');
    const overlay = document.querySelector('.mobile-drawer-overlay');
    const closeBtn = document.querySelector('.mobile-drawer-close');
    const drawerLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggle || !overlay) return;

    const openDrawer = () => {
      overlay.classList.add('active');
      toggle.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      overlay.classList.remove('active');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.classList.contains('active') ? closeDrawer() : openDrawer();
    });

    closeBtn?.addEventListener('click', closeDrawer);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeDrawer();
    });

    drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));
  },

  /**
   * Highlight active link based on current path
   */
  highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === currentPath || (currentPath === '' && linkHref === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};
