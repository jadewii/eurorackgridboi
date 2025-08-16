// Authentication check for protected pages
(function() {
    'use strict';
    
    // Check if user is logged in
    function checkAuth() {
        const userData = localStorage.getItem('eurogrid_user');
        
        if (!userData) {
            // Not logged in, redirect to login
            window.location.href = '/login.html';
            return null;
        }
        
        try {
            const user = JSON.parse(userData);
            
            // Check if session is still valid (24 hours)
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursSinceLogin > 24) {
                // Session expired
                localStorage.removeItem('eurogrid_user');
                window.location.href = '/login.html?expired=true';
                return null;
            }
            
            return user;
        } catch (e) {
            // Invalid user data
            localStorage.removeItem('eurogrid_user');
            window.location.href = '/login.html';
            return null;
        }
    }
    
    // Display user info in header
    function displayUserInfo(user) {
        // Find or create user info element
        let userInfo = document.getElementById('user-info');
        if (!userInfo) {
            // Create user info in nav if it doesn't exist
            const nav = document.querySelector('.main-nav');
            if (nav) {
                userInfo = document.createElement('div');
                userInfo.id = 'user-info';
                userInfo.style.cssText = `
                    position: absolute;
                    right: 40px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    font-size: 14px;
                `;
                nav.appendChild(userInfo);
            }
        }
        
        if (userInfo) {
            userInfo.innerHTML = `
                <span style="color: #666;">Welcome,</span>
                <span style="font-weight: bold;">${user.name}</span>
                <button onclick="logout()" style="
                    padding: 8px 16px;
                    background: #333;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">Logout</button>
            `;
        }
    }
    
    // Logout function
    window.logout = function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('eurogrid_user');
            localStorage.removeItem('eurogrid_cart');
            localStorage.removeItem('purchased_modules');
            window.location.href = '/login.html';
        }
    };
    
    // Initialize user modules
    function initializeUserModules(user) {
        // Get purchased modules from localStorage
        const purchasedModules = JSON.parse(localStorage.getItem('purchased_modules') || '[]');
        
        // Merge with user's saved modules
        if (!user.modules) {
            user.modules = [];
        }
        
        // Add purchased modules to user's collection
        purchasedModules.forEach(moduleId => {
            if (!user.modules.includes(moduleId)) {
                user.modules.push(moduleId);
            }
        });
        
        // Save updated user data
        localStorage.setItem('eurogrid_user', JSON.stringify(user));
        
        return user.modules;
    }
    
    // Export functions for use in other scripts
    window.EurogridAuth = {
        checkAuth: checkAuth,
        displayUserInfo: displayUserInfo,
        initializeUserModules: initializeUserModules,
        logout: logout
    };
    
    // Auto-check auth on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Only check auth on protected pages
        const protectedPages = [
            'my-modules.html',
            'my-racks.html',
            'my-studio.html',
            'profile.html'
        ];
        
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            const user = checkAuth();
            if (user) {
                displayUserInfo(user);
                initializeUserModules(user);
                
                // Trigger custom event for page-specific initialization
                window.dispatchEvent(new CustomEvent('userAuthenticated', { detail: user }));
            }
        }
    });
})();