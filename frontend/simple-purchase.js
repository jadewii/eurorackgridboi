// Simple Purchase System - The Smart Way
// Uses Stripe Checkout + localStorage + Restore function

class SimplePurchaseSystem {
  constructor() {
    this.loadOwnership();
    this.setupUI();
  }

  // Load ownership from localStorage
  loadOwnership() {
    const stored = localStorage.getItem('eurorack_ownership');
    if (stored) {
      this.ownership = JSON.parse(stored);
    } else {
      this.ownership = {
        email: null,
        modules: [],
        jamnutz: 1000, // Welcome bonus
        lastRestore: null
      };
    }
  }

  // Save ownership to localStorage
  saveOwnership() {
    localStorage.setItem('eurorack_ownership', JSON.stringify(this.ownership));
    this.updateUI();
  }

  // Check if user owns a module
  ownsModule(moduleId) {
    return this.ownership.modules.includes(moduleId);
  }

  // Get module image URL with Cloudflare Transform
  getModuleImage(moduleId, width = 300) {
    const baseUrl = 'https://eurorackgrid.r2.dev';
    const hash = this.generateHash(moduleId).substring(0, 6);
    
    if (this.ownsModule(moduleId)) {
      // Animated WebP for owners
      return `${baseUrl}/cdn-cgi/image/width=${width},format=webp/modules/${hash}_${moduleId}.webp`;
    } else {
      // Static preview for non-owners
      return `${baseUrl}/cdn-cgi/image/width=${width},format=webp,quality=50,blur=10/previews/${moduleId}_preview.jpg`;
    }
  }

  // Simple hash to prevent URL guessing
  generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // Purchase with Stripe Checkout (no backend needed!)
  async purchaseModule(moduleId, price = 5) {
    // Stripe Checkout link with metadata
    const checkoutUrl = `https://checkout.stripe.com/c/pay/cs_live_XXX#${encodeURIComponent(JSON.stringify({
      module: moduleId,
      email: this.ownership.email
    }))}`;
    
    // Open Stripe Checkout
    window.location.href = checkoutUrl;
  }

  // Handle Stripe success redirect
  async handleCheckoutSuccess() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      // Add purchased module immediately (optimistic)
      const pendingModule = sessionStorage.getItem('pending_purchase');
      if (pendingModule) {
        this.ownership.modules.push(pendingModule);
        this.saveOwnership();
        sessionStorage.removeItem('pending_purchase');
      }
      
      // Then verify with restore function
      await this.restorePurchases(null, sessionId);
    }
  }

  // Restore purchases from Stripe (THE KEY FEATURE!)
  async restorePurchases(email = null, sessionId = null) {
    try {
      const restoreEmail = email || this.ownership.email || prompt('Enter your email to restore purchases:');
      if (!restoreEmail && !sessionId) return;

      const response = await fetch('/.netlify/functions/restore-purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: restoreEmail,
          session_id: sessionId 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update ownership
        this.ownership = {
          email: data.email,
          modules: data.ownedModules,
          jamnutz: data.jamnutz || 1000,
          lastRestore: new Date().toISOString()
        };
        this.saveOwnership();
        
        alert(`✅ Restored ${data.restored} modules!`);
        this.updateUI();
      } else {
        alert('No purchases found for this email');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Could not restore purchases. Please try again.');
    }
  }

  // Update UI based on ownership
  updateUI() {
    // Update all module images
    document.querySelectorAll('[data-module]').forEach(element => {
      const moduleId = element.dataset.module;
      const isOwned = this.ownsModule(moduleId);
      
      // Update image source
      if (element.tagName === 'IMG') {
        element.src = this.getModuleImage(moduleId);
      }
      
      // Toggle classes
      element.classList.toggle('owned', isOwned);
      element.classList.toggle('locked', !isOwned);
      
      // Add purchase button for non-owned
      if (!isOwned && !element.querySelector('.purchase-btn')) {
        const btn = document.createElement('button');
        btn.className = 'purchase-btn';
        btn.innerHTML = 'Buy $5';
        btn.onclick = () => {
          sessionStorage.setItem('pending_purchase', moduleId);
          this.purchaseModule(moduleId);
        };
        element.appendChild(btn);
      }
    });

    // Update jamnutz display
    const jamnutzDisplay = document.getElementById('jamnutz-count');
    if (jamnutzDisplay) {
      jamnutzDisplay.textContent = this.ownership.jamnutz;
    }
  }

  // Setup UI elements
  setupUI() {
    // Add restore button to page
    const restoreBtn = document.createElement('button');
    restoreBtn.id = 'restore-purchases';
    restoreBtn.textContent = 'Restore Purchases';
    restoreBtn.onclick = () => this.restorePurchases();
    restoreBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #FFD700;
      border: 2px solid #000;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
    `;
    document.body.appendChild(restoreBtn);

    // Check for Stripe success redirect
    if (window.location.search.includes('session_id=')) {
      this.handleCheckoutSuccess();
    }

    // Initial UI update
    this.updateUI();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.purchaseSystem = new SimplePurchaseSystem();
});