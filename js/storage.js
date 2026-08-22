/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — STORAGE MANAGER
 * storage.js
 * ═══════════════════════════════════════════════════════════════
 */

const StorageManager = {
  CART_KEY: 'craver_cart_items',

  /**
   * Retrieve all cart items from LocalStorage
   * @returns {Array} List of cart item objects
   */
  getCart() {
    try {
      const data = localStorage.getItem(this.CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse cart from LocalStorage:', e);
      return [];
    }
  },

  /**
   * Save cart items array to LocalStorage
   * @param {Array} cartItems
   */
  saveCart(cartItems) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cartItems));
      this.updateCartBadge();
      window.dispatchEvent(new CustomEvent('craver:cartUpdated', { detail: { cart: cartItems } }));
    } catch (e) {
      console.error('Failed to save cart to LocalStorage:', e);
    }
  },

  /**
   * Get total quantity count of all items in cart
   * @returns {number}
   */
  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  /**
   * Update the header cart count badge on all pages
   */
  updateCartBadge() {
    const badgeElements = document.querySelectorAll('.cart-badge');
    const count = this.getCartCount();
    badgeElements.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  /**
   * Clear entire cart
   */
  clearCart() {
    localStorage.removeItem(this.CART_KEY);
    this.updateCartBadge();
    window.dispatchEvent(new CustomEvent('craver:cartUpdated', { detail: { cart: [] } }));
  }
};
