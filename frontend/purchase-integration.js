// EURORACK.GRID Purchase System
// Integrates with your existing site - minimal changes!

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYgsv4gIwqVMMT0RjqcI7CxNbKlfPR_Y",
  authDomain: "eurorackgrid.firebaseapp.com",
  projectId: "eurorackgrid",
  storageBucket: "eurorackgrid.firebasestorage.app",
  messagingSenderId: "194513784993",
  appId: "1:194513784993:web:7b5bd434794ac8f11260e0"
};

// Initialize when page loads
async function initializePurchaseSystem() {
    // Dynamically import Firebase
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { getFirestore, doc, getDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    // Store globally
    window.eurorackAuth = auth;
    window.eurorackDb = db;
    
    // Track current user
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            window.currentUser = user;
            console.log('User logged in:', user.email);
            await loadUserModules(user.uid);
            updateUIForUser();
        } else {
            window.currentUser = null;
            console.log('No user logged in');
            updateUIForGuest();
        }
    });
}

// Load user's owned modules
async function loadUserModules(userId) {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
        const userDoc = await getDoc(doc(window.eurorackDb, 'users', userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            window.userModules = data.ownedModules || [];
            window.userJamnutz = data.jamnutz || 1000;
        } else {
            // New user - create their document
            await setDoc(doc(window.eurorackDb, 'users', userId), {
                email: window.currentUser.email,
                ownedModules: [],
                jamnutz: 1000, // Welcome bonus!
                createdAt: new Date()
            });
            window.userModules = [];
            window.userJamnutz = 1000;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Add UI elements for logged in user
function updateUIForUser() {
    // Add user info to header if not exists
    if (!document.getElementById('userPanel')) {
        const header = document.querySelector('.header-bar') || document.querySelector('header') || document.body;
        const userPanel = document.createElement('div');
        userPanel.id = 'userPanel';
        userPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: 'Courier New', monospace;
        `;
        userPanel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="color: #ffd700; font-weight: bold;">🥜 ${window.userJamnutz}</span>
                <span style="color: #333;">${window.currentUser.email}</span>
                <button onclick="logoutUser()" style="
                    background: #000;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                ">Logout</button>
            </div>
        `;
        header.appendChild(userPanel);
    }
    
    // Mark owned modules
    markOwnedModules();
}

// Update UI for guest
function updateUIForGuest() {
    const userPanel = document.getElementById('userPanel');
    if (userPanel) userPanel.remove();
    
    // Add login prompt
    if (!document.getElementById('loginPrompt')) {
        const header = document.querySelector('.header-bar') || document.querySelector('header') || document.body;
        const loginPrompt = document.createElement('div');
        loginPrompt.id = 'loginPrompt';
        loginPrompt.style.cssText = `
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
        loginPrompt.innerHTML = `Login to Buy Modules`;
        loginPrompt.onclick = showLoginModal;
        header.appendChild(loginPrompt);
    }
}

// Mark modules user owns
function markOwnedModules() {
    if (!window.userModules) return;
    
    document.querySelectorAll('.module-slot').forEach(module => {
        const moduleName = module.getAttribute('data-module');
        if (window.userModules.includes(moduleName)) {
            module.classList.add('user-owned');
            // Add small owned indicator
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

// Show login modal
function showLoginModal() {
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
            <h2 style="margin: 0 0 20px 0;">Login or Sign Up</h2>
            <input type="email" id="emailInput" placeholder="Email" style="
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 5px;
            ">
            <input type="password" id="passwordInput" placeholder="Password" style="
                width: 100%;
                padding: 10px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 5px;
            ">
            <div style="display: flex; gap: 10px;">
                <button onclick="handleLogin()" style="
                    flex: 1;
                    padding: 10px;
                    background: #000;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Login</button>
                <button onclick="handleSignUp()" style="
                    flex: 1;
                    padding: 10px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Sign Up</button>
                <button onclick="closeLoginModal()" style="
                    padding: 10px 20px;
                    background: #ccc;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Handle login
window.handleLogin = async function() {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    try {
        await signInWithEmailAndPassword(window.eurorackAuth, email, password);
        closeLoginModal();
        alert('Logged in successfully!');
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
};

// Handle sign up
window.handleSignUp = async function() {
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    
    try {
        await createUserWithEmailAndPassword(window.eurorackAuth, email, password);
        closeLoginModal();
        alert('Account created! You got 1000 free jamnutz!');
    } catch (error) {
        alert('Sign up failed: ' + error.message);
    }
};

// Close login modal
window.closeLoginModal = function() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.remove();
};

// Logout
window.logoutUser = async function() {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    await signOut(window.eurorackAuth);
    location.reload();
};

// Add click handler for modules
document.addEventListener('click', async function(e) {
    const module = e.target.closest('.module-slot');
    if (!module) return;
    
    const moduleName = module.getAttribute('data-module');
    if (!moduleName) return;
    
    // Check if user owns it
    if (window.userModules && window.userModules.includes(moduleName)) {
        return; // Already owned
    }
    
    // Show purchase option
    if (!window.currentUser) {
        alert('Please login to purchase modules!');
        showLoginModal();
        return;
    }
    
    if (confirm(`Purchase "${moduleName}" for 500 jamnutz?`)) {
        await purchaseModule(moduleName);
    }
});

// Purchase module
async function purchaseModule(moduleName) {
    const { doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    if (window.userJamnutz < 500) {
        alert('Not enough jamnutz! You need 500.');
        return;
    }
    
    try {
        // Update user document
        await updateDoc(doc(window.eurorackDb, 'users', window.currentUser.uid), {
            ownedModules: arrayUnion(moduleName),
            jamnutz: window.userJamnutz - 500
        });
        
        window.userModules.push(moduleName);
        window.userJamnutz -= 500;
        
        alert(`✅ You now own "${moduleName}"!`);
        updateUIForUser();
        markOwnedModules();
        
    } catch (error) {
        alert('Purchase failed: ' + error.message);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePurchaseSystem);
} else {
    initializePurchaseSystem();
}

console.log('💰 EurorackGrid Purchase System Loaded!');