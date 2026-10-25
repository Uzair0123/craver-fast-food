/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — CHECKOUT CONTROLLER
 * checkout.js
 * ═══════════════════════════════════════════════════════════════
 */

const CheckoutModule = {
  state: {
    paymentMethod: 'cod', // 'cod' | 'card' | 'upi'
    deliverySpeed: 'standard'
  },

  elements: {
    form: null,
    previewList: null,
    subtotalEl: null,
    deliveryEl: null,
    taxEl: null,
    totalEl: null,
    receiptOverlay: null,
    paymentOptions: []
  },

  init() {
    this.elements.form = document.getElementById('checkoutForm');
    this.elements.previewList = document.getElementById('checkoutItemsPreview');
    this.elements.subtotalEl = document.getElementById('checkoutSubtotal');
    this.elements.deliveryEl = document.getElementById('checkoutDelivery');
    this.elements.taxEl = document.getElementById('checkoutTax');
    this.elements.totalEl = document.getElementById('checkoutTotal');
    this.elements.receiptOverlay = document.getElementById('receiptModalOverlay');
    this.elements.paymentOptions = document.querySelectorAll('.payment-card-label');

    if (!this.elements.form) return;

    this.checkCartAndRender();
    this.bindEvents();
  },

  /**
   * Ensure cart has items, then render preview
   */
  checkCartAndRender() {
    if (typeof StorageManager === 'undefined') return;

    const cart = StorageManager.getCart();

    // If cart is empty, redirect to menu
    if (!cart || cart.length === 0) {
      alert('Your cart is empty! Redirecting to menu...');
      window.location.href = 'menu.html';
      return;
    }

    // Render Preview Items
    this.elements.previewList.innerHTML = cart.map(item => `
      <div class="checkout-item-mini">
        <span class="checkout-item-mini-name">${item.quantity || 1}x ${item.name}</span>
        <span class="checkout-item-mini-price">$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
      </div>
    `).join('');

    // Totals
    const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    const deliveryFee = subtotal >= 25.0 ? 0.0 : 3.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    this.elements.subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    this.elements.deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
    this.elements.taxEl.textContent = `$${tax.toFixed(2)}`;
    this.elements.totalEl.textContent = `$${total.toFixed(2)}`;
  },

  bindEvents() {
    // 1. Payment Radio Selector
    this.elements.paymentOptions.forEach(card => {
      card.addEventListener('click', () => {
        this.elements.paymentOptions.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          this.state.paymentMethod = radio.value;
        }

        // Toggle Demo Card Fields
        const cardBox = document.getElementById('cardDemoBox');
        if (cardBox) {
          cardBox.style.display = this.state.paymentMethod === 'card' ? 'block' : 'none';
        }
      });
    });

    // 2. Form Submit (Order Processing)
    this.elements.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.processOrder();
    });
  },

  /**
   * Process & simulate order placement
   */
  processOrder() {
    const fullName = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const city = document.getElementById('custCity').value.trim();
    const notes = document.getElementById('custNotes').value.trim();

    if (!fullName || !phone || !address || !city) {
      alert('Please fill out all required delivery fields.');
      return;
    }

    const orderId = `#CRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalTotal = this.elements.totalEl.textContent;
    const paymentLabel = this.state.paymentMethod === 'cod' ? 'Cash on Delivery' : (this.state.paymentMethod === 'card' ? 'Credit Card (Simulated)' : 'UPI / Mobile Pay');

    // Populate Receipt
    document.getElementById('receiptOrderId').textContent = `Order ID: ${orderId}`;
    document.getElementById('receiptCustomerName').textContent = fullName;
    document.getElementById('receiptCustomerPhone').textContent = phone;
    document.getElementById('receiptDeliveryAddress').textContent = `${address}, ${city}`;
    document.getElementById('receiptPaymentMethod').textContent = paymentLabel;
    document.getElementById('receiptTotalPaid').textContent = finalTotal;

    // Dispatch real order to Backend Microservice (Saved into Redis!)
    const orderPayload = {
      orderId: orderId,
      customerName: fullName,
      phone: phone,
      address: `${address}, ${city}`,
      notes: notes,
      paymentMethod: paymentLabel,
      total: finalTotal,
      items: (typeof StorageManager !== 'undefined') ? StorageManager.getCart() : []
    };

    const backendHost = window.location.hostname || 'localhost';
    fetch(`http://${backendHost}:5000/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Order saved to Redis volume:', data);
    })
    .catch(err => {
      console.warn('⚠️ Backend API not reachable:', err);
    });

    // Open Receipt Modal
    this.elements.receiptOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Clear cart in Storage
    if (typeof StorageManager !== 'undefined') {
      StorageManager.clearCart();
    }

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show(`Order ${orderId} placed successfully! Sizzling now!`, 'fa-solid fa-fire');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CheckoutModule.init();
});
