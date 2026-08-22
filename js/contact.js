/**
 * ═══════════════════════════════════════════════════════════════
 * CRAVER FAST FOOD CO. — CONTACT & FAQ CONTROLLER
 * contact.js
 * ═══════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    header?.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      faqItems.forEach(other => other.classList.remove('active'));
      if (!wasActive) {
        item.classList.add('active');
      }
    });
  });

  // 2. Contact Form Submit
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('contactName')?.value.trim();
    const email = document.getElementById('contactEmail')?.value.trim();
    const message = document.getElementById('contactMessage')?.value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    if (typeof ToastNotification !== 'undefined') {
      ToastNotification.show(`Thank you <strong>${name}</strong>! Your message has been sent to our kitchen team.`, 'fa-solid fa-paper-plane');
    }

    contactForm.reset();
  });
});
