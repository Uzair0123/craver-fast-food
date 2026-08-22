/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — FOOD DETAILS MODAL CONTROLLER
 * modal.js
 * ═══════════════════════════════════════════════════════════════
 */

const FoodModalModule = {
  currentProduct: null,
  quantity: 1,
  overlay: null,

  init() {
    this.createModalDOM();
    this.bindEvents();
  },

  /**
   * Inject the reusable modal DOM skeleton
   */
  createModalDOM() {
    let overlay = document.getElementById('foodModalOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'foodModalOverlay';
      overlay.className = 'modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="food-modal-dialog">
          <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close food details">&times;</button>
          <div class="food-modal-grid">
            <!-- Modal Left Image -->
            <div class="modal-img-wrap">
              <div class="modal-img-badges" id="modalBadges"></div>
              <img src="" alt="" id="modalImg" class="modal-img">
            </div>
            <!-- Modal Right Info -->
            <div class="modal-info-wrap">
              <div>
                <div class="modal-category-row">
                  <span class="modal-category-tag" id="modalCategory"></span>
                  <span class="modal-rating-badge" id="modalRating"></span>
                </div>
                <h2 class="modal-title" id="modalTitle"></h2>
                <div class="modal-price-row">
                  <span class="modal-current-price" id="modalPrice"></span>
                  <span class="modal-old-price" id="modalOldPrice"></span>
                  <span class="modal-calories-badge" id="modalCalories"></span>
                </div>
                <p class="modal-desc" id="modalDesc"></p>
              </div>

              <div>
                <div class="modal-actions-box">
                  <div class="modal-stepper-row">
                    <span class="stepper-label">Quantity:</span>
                    <div class="qty-stepper">
                      <button class="stepper-btn" id="stepperMinus" aria-label="Decrease quantity">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span class="stepper-qty" id="stepperQty">1</span>
                      <button class="stepper-btn" id="stepperPlus" aria-label="Increase quantity">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  <button class="btn btn-primary btn-lg modal-add-btn" id="modalAddBtn">
                    <i class="fa-solid fa-bag-shopping"></i> <span id="modalAddBtnText">Add to Bag • $0.00</span>
                  </button>
                </div>

                <div class="modal-perks-row">
                  <span><i class="fa-solid fa-bolt" style="color:var(--color-primary);"></i> 30-Min Fast Delivery</span>
                  <span><i class="fa-solid fa-shield-heart" style="color:var(--color-accent-green);"></i> Made Fresh to Order</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    this.overlay = overlay;
  },

  bindEvents() {
    const closeBtn = document.getElementById('modalCloseBtn');
    const plusBtn = document.getElementById('stepperPlus');
    const minusBtn = document.getElementById('stepperMinus');
    const addBtn = document.getElementById('modalAddBtn');

    closeBtn?.addEventListener('click', () => this.close());

    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlay?.classList.contains('active')) {
        this.close();
      }
    });

    plusBtn?.addEventListener('click', () => this.updateQuantity(this.quantity + 1));
    minusBtn?.addEventListener('click', () => this.updateQuantity(this.quantity - 1));

    addBtn?.addEventListener('click', () => this.handleAddToCart());
  },

  /**
   * Open modal with product details
   * @param {string} productId
   */
  open(productId) {
    if (typeof PRODUCTS_DATA === 'undefined') return;
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    this.currentProduct = product;
    this.quantity = 1;

    // Populate Fields
    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalImg').alt = product.name;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalCategory').textContent = product.category;
    document.getElementById('modalRating').innerHTML = `<i class="fa-solid fa-star"></i> ${product.rating} (${product.reviewsCount} reviews)`;
    document.getElementById('modalPrice').textContent = `$${product.price.toFixed(2)}`;
    
    const oldPriceEl = document.getElementById('modalOldPrice');
    if (product.originalPrice) {
      oldPriceEl.textContent = `$${product.originalPrice.toFixed(2)}`;
      oldPriceEl.style.display = 'inline';
    } else {
      oldPriceEl.style.display = 'none';
    }

    document.getElementById('modalCalories').textContent = product.calories || 'Freshly Prepared';
    document.getElementById('modalDesc').textContent = product.description;

    // Badges
    let badgesHTML = '';
    if (product.isPopular) badgesHTML += `<span class="badge badge-popular"><i class="fa-solid fa-fire"></i> Best Seller</span>`;
    if (product.isSpicy) badgesHTML += `<span class="badge badge-spicy"><i class="fa-solid fa-pepper-hot"></i> Fiery Spicy</span>`;
    if (product.isVeg) badgesHTML += `<span class="badge badge-veg"><i class="fa-solid fa-leaf"></i> 100% Vegetarian</span>`;
    document.getElementById('modalBadges').innerHTML = badgesHTML;

    // Update Quantity and Button Text
    this.updateQuantity(1);

    // Show Overlay
    this.overlay.classList.add('active');
    this.overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  },

  /**
   * Close modal
   */
  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('active');
    this.overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  /**
   * Update Quantity Stepper
   * @param {number} newQty
   */
  updateQuantity(newQty) {
    if (newQty < 1) newQty = 1;
    if (newQty > 20) newQty = 20;

    this.quantity = newQty;
    document.getElementById('stepperQty').textContent = this.quantity;

    if (this.currentProduct) {
      const totalPrice = (this.currentProduct.price * this.quantity).toFixed(2);
      document.getElementById('modalAddBtnText').textContent = `Add ${this.quantity} to Bag • $${totalPrice}`;
    }
  },

  /**
   * Add selected quantity to cart
   */
  handleAddToCart() {
    if (!this.currentProduct) return;

    if (typeof StorageManager !== 'undefined') {
      const cart = StorageManager.getCart();
      const existing = cart.find(i => i.id === this.currentProduct.id);

      if (existing) {
        existing.quantity = (existing.quantity || 1) + this.quantity;
      } else {
        cart.push({
          id: this.currentProduct.id,
          name: this.currentProduct.name,
          price: this.currentProduct.price,
          image: this.currentProduct.image,
          category: this.currentProduct.category,
          quantity: this.quantity
        });
      }

      StorageManager.saveCart(cart);
    }

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show(`Added <strong>${this.quantity}x ${this.currentProduct.name}</strong> to your bag!`, 'fa-solid fa-bag-shopping');
    }

    this.close();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FoodModalModule.init();
});
