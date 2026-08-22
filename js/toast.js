/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — TOAST NOTIFICATIONS
 * toast.js
 * ═══════════════════════════════════════════════════════════════
 */

const ToastNotification = {
  container: null,

  init() {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }
    this.container = container;
  },

  /**
   * Show a toast message
   * @param {string} message
   * @param {string} icon (optional FontAwesome class)
   */
  show(message, icon = 'fa-solid fa-circle-check') {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="${icon} toast-icon"></i>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 350);
    }, 3000);
  }
};
