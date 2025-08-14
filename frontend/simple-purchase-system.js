// Simple Purchase System for EURORACK.GRID
// No Firebase needed - just localStorage + Stripe later

class EurorackStore {
    constructor() {
        // Initialize from localStorage
        this.userData = this.loadUserData();
    }
    
    loadUserData() {
        const stored = localStorage.getItem('eurorack_user');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Default new user data
        return {
            id: 'user_' + Date.now(),
            jamnutz: 1000, // Welcome bonus
            ownedModules: [],
            subscription: null,
            racks: []
        };
    }
    
    saveUserData() {
        localStorage.setItem('eurorack_user', JSON.stringify(this.userData));
    }
    
    // Check if user owns a module
    ownsModule(moduleName) {
        return this.userData.ownedModules.includes(moduleName);
    }
    
    // Purchase module with jamnutz
    purchaseWithJamnutz(moduleName) {
        const price = 500;
        
        if (this.userData.jamnutz < price) {
            return { success: false, message: 'Not enough jamnutz!' };
        }
        
        if (this.ownsModule(moduleName)) {
            return { success: false, message: 'Already owned!' };
        }
        
        // Process purchase
        this.userData.jamnutz -= price;
        this.userData.ownedModules.push(moduleName);
        this.saveUserData();
        
        return { success: true, message: 'Module purchased!' };
    }
    
    // Purchase module with Stripe (placeholder)
    async purchaseWithCash(moduleName) {
        // This would connect to Stripe
        alert('Stripe payment coming soon! Module: ' + moduleName);
        // For now, just give it to them
        this.userData.ownedModules.push(moduleName);
        this.saveUserData();
        return { success: true };
    }
    
    // Get jamnutz balance
    getBalance() {
        return this.userData.jamnutz;
    }
    
    // Add jamnutz (for purchases or rewards)
    addJamnutz(amount) {
        this.userData.jamnutz += amount;
        this.saveUserData();
    }
    
    // Save a rack configuration
    saveRack(rackData) {
        this.userData.racks.push({
            id: 'rack_' + Date.now(),
            created: new Date().toISOString(),
            ...rackData
        });
        this.saveUserData();
    }
}

// Initialize store globally
window.eurorackStore = new EurorackStore();

// Add to page functionality
function initializePurchaseButtons() {
    // Find all module purchase areas and add functionality
    document.addEventListener('click', function(e) {
        // Check if clicked element is a module or buy button
        const moduleElement = e.target.closest('.module-slot');
        
        if (moduleElement) {
            const moduleName = moduleElement.getAttribute('data-module');
            
            if (moduleName && !window.eurorackStore.ownsModule(moduleName)) {
                // Show purchase options
                showPurchaseModal(moduleName);
            }
        }
    });
}

function showPurchaseModal(moduleName) {
    // Simple modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 50px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
    `;
    
    modal.innerHTML = `
        <h3 style="margin: 0 0 20px 0; color: black;">Purchase ${moduleName}</h3>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="purchaseJamnutz('${moduleName}')" style="
                padding: 10px 20px;
                background: #ffd700;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">🥜 500 Jamnutz</button>
            <button onclick="purchaseCash('${moduleName}')" style="
                padding: 10px 20px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
            ">💳 $5.00</button>
            <button onclick="closePurchaseModal()" style="
                padding: 10px 20px;
                background: #ccc;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            ">Cancel</button>
        </div>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'purchaseBackdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
    `;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
    window.currentPurchaseModal = modal;
}

window.purchaseJamnutz = function(moduleName) {
    const result = window.eurorackStore.purchaseWithJamnutz(moduleName);
    alert(result.message);
    closePurchaseModal();
    if (result.success) {
        location.reload(); // Refresh to show ownership
    }
};

window.purchaseCash = function(moduleName) {
    window.eurorackStore.purchaseWithCash(moduleName);
    closePurchaseModal();
};

window.closePurchaseModal = function() {
    const backdrop = document.getElementById('purchaseBackdrop');
    if (backdrop) backdrop.remove();
    if (window.currentPurchaseModal) {
        window.currentPurchaseModal.remove();
        window.currentPurchaseModal = null;
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePurchaseButtons();
    
    // Update any jamnutz displays
    const jamnutzDisplays = document.querySelectorAll('.jamnutz-balance');
    jamnutzDisplays.forEach(display => {
        display.textContent = window.eurorackStore.getBalance();
    });
});

console.log('💰 Simple purchase system loaded!');
console.log('Current balance:', window.eurorackStore.getBalance(), 'jamnutz');
console.log('Owned modules:', window.eurorackStore.userData.ownedModules);