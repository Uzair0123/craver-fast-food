/**
 * Craver AI Assistant - Microservice Integration
 * Connects frontend to the containerized Python backend (Port 5000),
 * which securely proxies requests to the internal AI inference container.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Inject Floating Button and Modal Styles
  const style = document.createElement("style");
  style.textContent = `
    .craver-ai-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: linear-gradient(135deg, #ff4757, #ff6b81);
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(255, 71, 87, 0.4);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 9999;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    .craver-ai-float-btn:hover {
      transform: translateY(-3px) scale(1.03);
      box-shadow: 0 12px 30px rgba(255, 71, 87, 0.5);
    }
    .craver-ai-float-btn i {
      font-size: 18px;
    }
    .craver-ai-modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .craver-ai-modal-overlay.active {
      display: flex;
    }
    .craver-ai-card {
      background: #ffffff;
      width: 90%;
      max-width: 480px;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
      animation: modalSlideUp 0.3s ease;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    @keyframes modalSlideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .craver-ai-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid #f1f2f6;
      padding-bottom: 12px;
    }
    .craver-ai-title {
      font-size: 18px;
      font-weight: 800;
      color: #2f3542;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .craver-ai-close {
      background: none;
      border: none;
      font-size: 22px;
      color: #a4b0be;
      cursor: pointer;
    }
    .craver-ai-response-box {
      min-height: 100px;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.6;
      color: #2f3542;
      border: 1px solid #e9ecef;
      white-space: pre-line;
    }
    .craver-ai-form {
      display: flex;
      gap: 8px;
    }
    .craver-ai-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #dfe4ea;
      border-radius: 12px;
      font-size: 14px;
      outline: none;
      transition: border 0.2s;
    }
    .craver-ai-input:focus {
      border-color: #ff4757;
    }
    .craver-ai-send-btn {
      background: #ff4757;
      color: #fff;
      border: none;
      padding: 12px 18px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 700;
      transition: background 0.2s;
    }
    .craver-ai-send-btn:hover {
      background: #e04050;
    }
    .craver-ai-send-btn:disabled {
      background: #ced6e0;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);

  // Inject Floating Button
  const floatBtn = document.createElement("button");
  floatBtn.className = "craver-ai-float-btn";
  floatBtn.innerHTML = `<i class="fa-solid fa-robot"></i> <span>Ask Craver AI</span>`;
  document.body.appendChild(floatBtn);

  // Inject Modal Structure
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "craver-ai-modal-overlay";
  modalOverlay.innerHTML = `
    <div class="craver-ai-card">
      <div class="craver-ai-header">
        <div class="craver-ai-title">
          <i class="fa-solid fa-wand-magic-sparkles" style="color:#ff4757;"></i>
          Craver AI Food Assistant
        </div>
        <button class="craver-ai-close">&times;</button>
      </div>
      <div class="craver-ai-response-box" id="craverAiResponse">
        👋 Hi! I'm Craver AI, running on a local containerized inference engine. Tell me what you're craving (e.g., "spicy meal", "sweet dessert", "meal under $8"), and I will recommend the best dish for you!
      </div>
      <form class="craver-ai-form" id="craverAiForm">
        <input type="text" class="craver-ai-input" id="craverAiInput" placeholder="What are you in the mood for?" required autocomplete="off">
        <button type="submit" class="craver-ai-send-btn" id="craverAiSubmit">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  // Modal Listeners
  const closeBtn = modalOverlay.querySelector(".craver-ai-close");
  const form = modalOverlay.querySelector("#craverAiForm");
  const input = modalOverlay.querySelector("#craverAiInput");
  const responseBox = modalOverlay.querySelector("#craverAiResponse");
  const submitBtn = modalOverlay.querySelector("#craverAiSubmit");

  floatBtn.addEventListener("click", () => {
    modalOverlay.classList.add("active");
    input.focus();
  });

  closeBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("active");
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("active");
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = input.value.trim();
    if (!prompt) return;

    submitBtn.disabled = true;
    input.disabled = true;
    responseBox.textContent = "🧠 Craver AI is cooking up a recommendation (running matrix math)...";

    try {
      // Call containerized Python backend
      const res = await fetch("http://localhost:5000/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt })
      });

      const data = await res.json();
      responseBox.textContent = data.recommendation || "Our staff recommends the Craver Double Smash Burger ($5.99)!";
    } catch (err) {
      console.error("AI Assistant Error:", err);
      responseBox.textContent = "⚠️ Could not connect to AI service. Try our Craver Double Smash Burger ($5.99)!";
    } finally {
      submitBtn.disabled = false;
      input.disabled = false;
      input.value = "";
      input.focus();
    }
  });
});
