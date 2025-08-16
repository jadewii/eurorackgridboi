// EURORACK.GRID Purchase System - SIMPLIFIED VERSION
// Uses localStorage for now until Firebase is fully configured

class SimpleUserSystem {
    constructor() {
        this.currentUser = this.loadUser();
        this.initUI();
    }
    
    loadUser() {
        const stored = localStorage.getItem('eurorack_user');
        if (stored) {
            return JSON.parse(stored);
        }
        return null;
    }
    
    saveUser() {
        if (this.currentUser) {
            localStorage.setItem('eurorack_user', JSON.stringify(this.currentUser));
        }
    }
    
    createUser(email, password) {
        // Simple local user creation
        this.currentUser = {
            id: 'user_' + Date.now(),
            email: email,
            jamnutz: 1000, // Welcome bonus!
            ownedModules: [],
            createdAt: new Date().toISOString()
        };
        this.saveUser();
        return this.currentUser;
    }
    
    login(email, password) {
        // Check if user exists
        const stored = localStorage.getItem('eurorack_user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user.email === email) {
                this.currentUser = user;
                return user;
            }
        }
        throw new Error('User not found. Please sign up first.');
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('eurorack_user_session');
        location.reload();
    }
    
    purchaseModule(moduleName) {
        if (!this.currentUser) {
            throw new Error('Please login first');
        }
        
        if (this.currentUser.jamnutz < 500) {
            throw new Error('Not enough jamnutz! You need 500.');
        }
        
        if (this.currentUser.ownedModules.includes(moduleName)) {
            throw new Error('You already own this module!');
        }
        
        // Process purchase
        this.currentUser.jamnutz -= 500;
        this.currentUser.ownedModules.push(moduleName);
        this.saveUser();
        
        return true;
    }
    
    initUI() {
        // Remove any Firebase error modals
        const errorModal = document.querySelector('.swal2-container');
        if (errorModal) errorModal.remove();
        
        if (this.currentUser) {
            this.showUserPanel();
            this.markOwnedModules();
        } else {
            this.showLoginButton();
        }
        
        // Add click handlers
        this.setupClickHandlers();
    }
    
    showUserPanel() {
        // Remove login button if exists
        const loginBtn = document.getElementById('loginPrompt');
        if (loginBtn) loginBtn.remove();
        
        // User panel is now integrated into universal-nav.js
    }
    
    showLoginButton() {
        if (!document.getElementById('loginPrompt')) {
            const btn = document.createElement('div');
            btn.id = 'loginPrompt';
            btn.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: black;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10000;
                cursor: pointer;
                font-family: 'Courier New', monospace;
            `;
            btn.textContent = 'Login to Buy Modules';
            btn.onclick = () => this.showLoginModal();
            document.body.appendChild(btn);
        }
    }
    
    showLoginModal() {
        // Remove any existing modals
        const existing = document.getElementById('loginModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                width: 90%;
                max-width: 400px;
            ">
                <h2 style="margin: 0 0 20px 0; color: black;">Login or Sign Up</h2>
                <div id="loginError" style="color: red; margin: 10px 0; display: none;"></div>
                <input type="email" id="emailInput" placeholder="Email" style="
                    width: 100%;
                    padding: 10px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
                <input type="password" id="passwordInput" placeholder="Password (6+ characters)" style="
                    width: 100%;
                    padding: 10px;
                    margin: 10px 0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    box-sizing: border-box;
                ">
                <div style="display: flex; gap: 10px;">
                    <button onclick="userSystem.handleLogin()" style="
                        flex: 1;
                        padding: 10px;
                        background: #000;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Login</button>
                    <button onclick="userSystem.handleSignUp()" style="
                        flex: 1;
                        padding: 10px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Sign Up</button>
                    <button onclick="userSystem.closeModal()" style="
                        padding: 10px 20px;
                        background: #ccc;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
                <p style="margin-top: 15px; color: #666; font-size: 12px;">
                    Note: This is a demo system using local storage. 
                    Your data is saved locally on this browser only.
                </p>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    handleLogin() {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const errorDiv = document.getElementById('loginError');
        
        try {
            this.login(email, password);
            this.closeModal();
            alert('Welcome back!');
            // Reload the page to show logged-in state
            location.reload();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    }
    
    handleSignUp() {
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        const errorDiv = document.getElementById('loginError');
        
        if (!email || !password) {
            errorDiv.textContent = 'Please enter email and password';
            errorDiv.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            errorDiv.textContent = 'Password must be at least 6 characters';
            errorDiv.style.display = 'block';
            return;
        }
        
        this.createUser(email, password);
        this.closeModal();
        alert('Welcome! You got 1000 free jamnutz! 🥜');
        // Reload the page to show logged-in state
        location.reload();
    }
    
    closeModal() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.remove();
    }
    
    markOwnedModules() {
        if (!this.currentUser) return;
        
        document.querySelectorAll('.module-slot').forEach(module => {
            const moduleName = module.getAttribute('data-module');
            if (this.currentUser.ownedModules.includes(moduleName)) {
                module.classList.add('user-owned');
                
                // Add owned badge
                if (!module.querySelector('.owned-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'owned-badge';
                    badge.style.cssText = `
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        background: #4CAF50;
                        color: white;
                        padding: 2px 5px;
                        border-radius: 3px;
                        font-size: 10px;
                        z-index: 10;
                    `;
                    badge.textContent = '✓';
                    module.appendChild(badge);
                }
            }
        });
    }
    
    setupClickHandlers() {
        document.addEventListener('click', (e) => {
            const module = e.target.closest('.module-slot');
            if (!module) return;
            
            const moduleName = module.getAttribute('data-module');
            if (!moduleName) return;
            
            // Check if owned
            if (this.currentUser && this.currentUser.ownedModules.includes(moduleName)) {
                return; // Already owned
            }
            
            // Show purchase prompt
            if (!this.currentUser) {
                alert('Please login to purchase modules!');
                this.showLoginModal();
                return;
            }
            
            if (confirm(`Purchase "${moduleName}" for 500 jamnutz?`)) {
                try {
                    this.purchaseModule(moduleName);
                    alert(`✅ You now own "${moduleName}"!`);
                    this.initUI();
                } catch (error) {
                    alert(error.message);
                }
            }
        });
    }
}

// Initialize the system
window.userSystem = new SimpleUserSystem();

console.log('💰 Simple Purchase System Loaded (Local Storage Version)!');