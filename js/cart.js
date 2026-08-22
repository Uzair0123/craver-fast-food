/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — SHOPPING CART CONTROLLER
 * cart.js
 * ═══════════════════════════════════════════════════════════════
 */

const CartModule = {
  state: {
    couponCode: '',
    discountPercent: 0,
    freeDelivery: false
  },

  VALID_COUPONS: {
    'CRAVE40': { discount: 0.40, freeDelivery: false, label: '40% OFF Mega Deal' },
    'CRAVEFREE': { discount: 0.0, freeDelivery: true, label: 'Free Delivery Deal' },
    'WELCOME10': { discount: 0.10, freeDelivery: false, label: '10% New Craver Discount' }
  },

  elements: {
    cartGrid: null,
    cartPanel: null,
    itemsList: null,
    emptyState: null,
    subtotal: null,
    delivery: null,
    tax: null,
    discountRow: null,
    discountVal: null,
    total: null,
    couponInput: null,
    activeCouponTag: null,
    activeCouponText: null,
    itemCountHeader: null
  },

  init() {
    this.elements.cartGrid = document.getElementById('cartLayoutGrid');
    this.elements.cartPanel = document.getElementById('cartItemsPanel');
    this.elements.itemsList = document.getElementById('cartItemsList');
    this.elements.emptyState = document.getElementById('emptyCartCard');
    this.elements.subtotal = document.getElementById('cartSubtotal');
    this.elements.delivery = document.getElementById('cartDelivery');
    this.elements.tax = document.getElementById('cartTax');
    this.elements.discountRow = document.getElementById('cartDiscountRow');
    this.elements.discountVal = document.getElementById('cartDiscountVal');
    this.elements.total = document.getElementById('cartTotal');
    this.elements.couponInput = document.getElementById('couponInput');
    this.elements.activeCouponTag = document.getElementById('activeCouponTag');
    this.elements.activeCouponText = document.getElementById('activeCouponText');
    this.elements.itemCountHeader = document.getElementById('cartItemCountHeader');

    if (!this.elements.cartGrid) return;

    this.bindEvents();
    this.render();

    // Listen for storage updates
    window.addEventListener('craver:cartUpdated', () => {
      this.render();
    });
  },

  bindEvents() {
    // Coupon Form
    document.getElementById('couponForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = this.elements.couponInput.value.trim().toUpperCase();
      this.applyCoupon(code);
    });

    // Remove Coupon
    document.getElementById('removeCouponBtn')?.addEventListener('click', () => {
      this.removeCoupon();
    });

    // Clear All Cart
    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      this.clearAll();
    });
  },

  /**
   * Render Cart Items and Calculations
   */
  render() {
    if (typeof StorageManager === 'undefined') return;

    const cart = StorageManager.getCart();

    // If empty
    if (!cart || cart.length === 0) {
      if (this.elements.cartGrid) this.elements.cartGrid.style.display = 'none';
      if (this.elements.emptyState) this.elements.emptyState.style.display = 'block';
      return;
    }

    if (this.elements.cartGrid) this.elements.cartGrid.style.display = 'grid';
    if (this.elements.emptyState) this.elements.emptyState.style.display = 'none';

    // Update item count in header
    const totalCount = StorageManager.getCartCount();
    if (this.elements.itemCountHeader) {
      this.elements.itemCountHeader.textContent = `(${totalCount} ${totalCount === 1 ? 'item' : 'items'})`;
    }

    // Render items list
    this.elements.itemsList.innerHTML = cart.map(item => this.createCartItemHTML(item)).join('');

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    
    // Delivery Fee: Free if subtotal > 25 or coupon applied, else $3.99
    let deliveryFee = subtotal >= 25.0 || this.state.freeDelivery ? 0.0 : 3.99;
    
    // Discount
    const discountAmount = subtotal * this.state.discountPercent;
    
    // Tax: 8% on subtotal after discount
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const tax = taxableAmount * 0.08;
    
    // Grand Total
    const grandTotal = taxableAmount + deliveryFee + tax;

    // Update DOM values
    this.elements.subtotal.textContent = `$${subtotal.toFixed(2)}`;
    this.elements.delivery.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
    this.elements.tax.textContent = `$${tax.toFixed(2)}`;
    this.elements.total.textContent = `$${grandTotal.toFixed(2)}`;

    // Discount row
    if (discountAmount > 0) {
      this.elements.discountRow.style.display = 'flex';
      this.elements.discountVal.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
      this.elements.discountRow.style.display = 'none';
    }
  },

  /**
   * Create HTML for single cart item row
   * @param {Object} item
   * @returns {string}
   */
  createCartItemHTML(item) {
    const itemTotal = (item.price * (item.quantity || 1)).toFixed(2);

    return `
      <div class="cart-item-card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-item-unit-price">$${item.price.toFixed(2)} each</span>
        </div>

        <div class="qty-stepper">
          <button class="stepper-btn" onclick="CartModule.changeQty('${item.id}', ${(item.quantity || 1) - 1})" aria-label="Decrease quantity">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="stepper-qty">${item.quantity || 1}</span>
          <button class="stepper-btn" onclick="CartModule.changeQty('${item.id}', ${(item.quantity || 1) + 1})" aria-label="Increase quantity">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div class="cart-item-total-price">$${itemTotal}</div>
          <button class="cart-item-remove-btn" onclick="CartModule.removeItem('${item.id}')" title="Remove item">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Modify quantity of an item
   * @param {string} productId
   * @param {number} newQty
   */
  changeQty(productId, newQty) {
    if (typeof StorageManager === 'undefined') return;

    let cart = StorageManager.getCart();

    if (newQty <= 0) {
      this.removeItem(productId);
      return;
    }

    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity = Math.min(20, newQty);
      StorageManager.saveCart(cart);
      this.render();
    }
  },

  /**
   * Remove item completely
   * @param {string} productId
   */
  removeItem(productId) {
    if (typeof StorageManager === 'undefined') return;

    let cart = StorageManager.getCart();
    const item = cart.find(i => i.id === productId);
    const itemName = item ? item.name : 'Item';

    cart = cart.filter(i => i.id !== productId);
    StorageManager.saveCart(cart);
    this.render();

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show(`Removed <strong>${itemName}</strong> from bag.`, 'fa-solid fa-trash-can');
    }
  },

  /**
   * Clear entire cart
   */
  clearAll() {
    if (typeof StorageManager === 'undefined') return;
    StorageManager.clearCart();
    this.render();

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show('Your bag has been emptied.', 'fa-solid fa-rotate-left');
    }
  },

  /**
   * Apply a discount coupon
   * @param {string} code
   */
  applyCoupon(code) {
    if (!code) return;

    const coupon = this.VALID_COUPONS[code];
    if (coupon) {
      this.state.couponCode = code;
      this.state.discountPercent = coupon.discount;
      this.state.freeDelivery = coupon.freeDelivery;

      if (this.elements.activeCouponTag && this.elements.activeCouponText) {
        this.elements.activeCouponTag.style.display = 'flex';
        this.elements.activeCouponText.textContent = `Applied: ${code} (${coupon.label})`;
      }

      if (this.elements.couponInput) this.elements.couponInput.value = '';

      if (typeof ToastNotification !== 'undefined') {
        ToastNotification.show(`Coupon <strong>${code}</strong> applied successfully!`, 'fa-solid fa-ticket');
      }

      this.render();
    } else {
      if (typeof ToastNotification !== 'undefined') {
        ToastNotification.show(`Invalid coupon code: "${code}". Try <strong>CRAVE40</strong> or <strong>CRAVEFREE</strong>.`, 'fa-solid fa-circle-exclamation');
      }
    }
  },

  /**
   * Remove active coupon
   */
  removeCoupon() {
    this.state.couponCode = '';
    this.state.discountPercent = 0;
    this.state.freeDelivery = false;

    if (this.elements.activeCouponTag) {
      this.elements.activeCouponTag.style.display = 'none';
    }

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show('Coupon removed.', 'fa-solid fa-tag');
    }

    this.render();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CartModule.init();
});
