/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — MENU CONTROLLER & DYNAMIC RENDERER
 * menu.js
 * ═══════════════════════════════════════════════════════════════
 */

const MenuModule = {
  state: {
    category: 'all',
    search: '',
    sort: 'popular',
    dietary: 'all' // 'all' | 'veg' | 'spicy' | 'popular'
  },

  elements: {
    grid: null,
    emptyState: null,
    resultsCount: null,
    searchInput: null,
    searchClear: null,
    sortSelect: null,
    categoryPills: [],
    dietaryChips: []
  },

  init() {
    this.elements.grid = document.getElementById('menuGrid');
    this.elements.emptyState = document.getElementById('menuEmptyState');
    this.elements.resultsCount = document.getElementById('resultsCount');
    this.elements.searchInput = document.getElementById('menuSearchInput');
    this.elements.searchClear = document.getElementById('searchClearBtn');
    this.elements.sortSelect = document.getElementById('menuSortSelect');
    this.elements.categoryPills = document.querySelectorAll('.category-pill');
    this.elements.dietaryChips = document.querySelectorAll('.dietary-chip');

    if (!this.elements.grid || typeof PRODUCTS_DATA === 'undefined') return;

    this.bindEvents();
    this.render();
  },

  bindEvents() {
    // 1. Category Pills Click
    this.elements.categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.elements.categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.state.category = pill.getAttribute('data-category');
        this.render();
      });
    });

    // 2. Real-time Search Input
    this.elements.searchInput?.addEventListener('input', (e) => {
      this.state.search = e.target.value.trim().toLowerCase();
      if (this.elements.searchClear) {
        this.elements.searchClear.style.display = this.state.search.length > 0 ? 'block' : 'none';
      }
      this.render();
    });

    // 3. Clear Search Button
    this.elements.searchClear?.addEventListener('click', () => {
      if (this.elements.searchInput) this.elements.searchInput.value = '';
      this.state.search = '';
      this.elements.searchClear.style.display = 'none';
      this.render();
    });

    // 4. Sort Select
    this.elements.sortSelect?.addEventListener('change', (e) => {
      this.state.sort = e.target.value;
      this.render();
    });

    // 5. Dietary Chips
    this.elements.dietaryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.elements.dietaryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.state.dietary = chip.getAttribute('data-dietary');
        this.render();
      });
    });
  },

  /**
   * Filter and sort products according to current state
   * @returns {Array} Filtered and sorted products
   */
  getFilteredProducts() {
    return PRODUCTS_DATA.filter(item => {
      // Category match
      if (this.state.category !== 'all' && item.category !== this.state.category) {
        return false;
      }

      // Dietary match
      if (this.state.dietary === 'veg' && !item.isVeg) return false;
      if (this.state.dietary === 'spicy' && !item.isSpicy) return false;
      if (this.state.dietary === 'popular' && !item.isPopular) return false;

      // Search match
      if (this.state.search) {
        const query = this.state.search;
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (this.state.sort === 'price-asc') return a.price - b.price;
      if (this.state.sort === 'price-desc') return b.price - a.price;
      if (this.state.sort === 'rating-desc') return b.rating - a.rating;
      // Default: popular first, then rating
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return b.rating - a.rating;
    });
  },

  /**
   * Render filtered products into the DOM
   */
  render() {
    const products = this.getFilteredProducts();

    // Update results count
    if (this.elements.resultsCount) {
      this.elements.resultsCount.innerHTML = `Showing <strong>${products.length}</strong> of <strong>${PRODUCTS_DATA.length}</strong> items`;
    }

    // Toggle Empty State
    if (products.length === 0) {
      this.elements.grid.innerHTML = '';
      if (this.elements.emptyState) this.elements.emptyState.style.display = 'block';
      return;
    }

    if (this.elements.emptyState) this.elements.emptyState.style.display = 'none';

    // Generate Cards HTML
    const cardsHTML = products.map(product => this.createFoodCardHTML(product)).join('');
    this.elements.grid.innerHTML = cardsHTML;
  },

  /**
   * Generate food card HTML string
   * @param {Object} item
   * @returns {string} HTML markup
   */
  createFoodCardHTML(item) {
    let badgesHTML = '';
    if (item.isPopular) {
      badgesHTML += `<span class="badge badge-popular"><i class="fa-solid fa-fire"></i> Popular</span>`;
    }
    if (item.isSpicy) {
      badgesHTML += `<span class="badge badge-spicy"><i class="fa-solid fa-pepper-hot"></i> Spicy</span>`;
    }
    if (item.isVeg) {
      badgesHTML += `<span class="badge badge-veg"><i class="fa-solid fa-leaf"></i> Veg</span>`;
    }

    const oldPriceHTML = item.originalPrice ? `<span class="food-old-price">$${item.originalPrice.toFixed(2)}</span>` : '';

    return `
      <div class="food-card" data-id="${item.id}">
        <div class="food-card-img-wrap" style="cursor:pointer;" onclick="FoodModalModule.open('${item.id}')" title="Click to view details">
          <div class="food-card-badges">
            ${badgesHTML}
          </div>
          <img src="${item.image}" alt="${item.name}" class="food-card-img" loading="lazy">
        </div>
        <div class="food-card-body">
          <div class="food-card-header">
            <span class="food-card-category">${item.category}</span>
            <span class="food-card-rating"><i class="fa-solid fa-star"></i> ${item.rating} (${item.reviewsCount})</span>
          </div>
          <h3 class="food-card-title" style="cursor:pointer;" onclick="FoodModalModule.open('${item.id}')" title="Click to view details">${item.name}</h3>
          <p class="food-card-desc">${item.description}</p>
          <div class="food-card-footer">
            <div class="food-card-price">
              <span class="food-current-price">$${item.price.toFixed(2)}</span>
              ${oldPriceHTML}
            </div>
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); MenuModule.handleQuickAdd('${item.id}')" aria-label="Add ${item.name} to Cart">
              <i class="fa-solid fa-plus"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Handle Quick Add to Cart Button
   * @param {string} productId
   */
  handleQuickAdd(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    if (typeof StorageManager !== 'undefined') {
      const cart = StorageManager.getCart();
      const existing = cart.find(i => i.id === product.id);

      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: 1
        });
      }

      StorageManager.saveCart(cart);
    }

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show(`Added <strong>${product.name}</strong> to your bag!`, 'fa-solid fa-bag-shopping');
    }
  },

  /**
   * Reset all filters
   */
  resetFilters() {
    this.state.category = 'all';
    this.state.search = '';
    this.state.sort = 'popular';
    this.state.dietary = 'all';

    this.elements.categoryPills.forEach((p, idx) => p.classList.toggle('active', idx === 0));
    this.elements.dietaryChips.forEach((c, idx) => c.classList.toggle('active', idx === 0));
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.searchClear) this.elements.searchClear.style.display = 'none';
    if (this.elements.sortSelect) this.elements.sortSelect.value = 'popular';

    this.render();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MenuModule.init();
});
