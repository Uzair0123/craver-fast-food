/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — MAIN APPLICATION COORDINATOR
 * app.js
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navigation Controller
  if (typeof NavigationModule !== 'undefined') {
    NavigationModule.init();
  }

  // 2. Initialize Storage & Update Cart Badge
  if (typeof StorageManager !== 'undefined') {
    StorageManager.updateCartBadge();
  }

  // 3. Initialize Toast Container
  if (typeof ToastNotification !== 'undefined') {
    ToastNotification.init();
  }

  // 4. Update Current Year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  console.log('🍔 Craver Fast Food Co. initialized successfully [Production Ready]');
});

