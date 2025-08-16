// Secure Module Image System for EurorackGrid
// This ensures only people who PAID can see the animated modules

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYgsv4gIwqVMMT0RjqcI7CxNbKlfPR_Y",
  authDomain: "eurorackgrid.firebaseapp.com",
  projectId: "eurorackgrid",
  storageBucket: "eurorackgrid.appspot.com",
  messagingSenderId: "194513784993",
  appId: "1:194513784993:web:7b5bd434794ac8f11260e0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

class SecureModuleSystem {
  constructor() {
    this.userModules = new Set();
    this.currentUser = null;
    this.initAuth();
  }

  initAuth() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadUserModules(user.uid);
      } else {
        this.currentUser = null;
        this.userModules.clear();
      }
      this.updateAllModuleImages();
    });
  }

  async loadUserModules(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.userModules = new Set(data.ownedModules || []);
        console.log(`User owns ${this.userModules.size} modules`);
      }
    } catch (error) {
      console.error('Error loading user modules:', error);
    }
  }

  async getModuleImageUrl(moduleName, isOwned) {
    try {
      if (isOwned) {
        // Get full animated WebP from secure storage
        const imageRef = ref(storage, `modules/animated/${moduleName}.webp`);
        return await getDownloadURL(imageRef);
      } else {
        // Get static preview (first frame, watermarked)
        const previewRef = ref(storage, `modules/previews/${moduleName}-preview.jpg`);
        return await getDownloadURL(previewRef);
      }
    } catch (error) {
      // Fallback to placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MT0NLRUQ8L3RleHQ+PC9zdmc+';
    }
  }

  ownsModule(moduleName) {
    return this.userModules.has(moduleName);
  }

  updateAllModuleImages() {
    // Find all module images on the page
    document.querySelectorAll('[data-module]').forEach(async (element) => {
      const moduleName = element.dataset.module;
      const isOwned = this.ownsModule(moduleName);
      
      // Update image source
      if (element.tagName === 'IMG') {
        const imageUrl = await this.getModuleImageUrl(moduleName, isOwned);
        element.src = imageUrl;
      }
      
      // Update classes for styling
      element.classList.toggle('module-owned', isOwned);
      element.classList.toggle('module-locked', !isOwned);
      
      // Add lock overlay for non-owned modules
      if (!isOwned && !element.querySelector('.lock-overlay')) {
        const lockOverlay = document.createElement('div');
        lockOverlay.className = 'lock-overlay';
        lockOverlay.innerHTML = `
          <div class="lock-icon">🔒</div>
          <div class="lock-price">500 🥜</div>
        `;
        lockOverlay.onclick = () => this.promptPurchase(moduleName);
        element.appendChild(lockOverlay);
      }
      
      // Enable/disable animation
      if (isOwned) {
        element.classList.add('animated');
      } else {
        element.classList.remove('animated');
        // Show static preview
        if (element.querySelector('img')) {
          element.querySelector('img').style.filter = 'blur(2px) grayscale(50%)';
        }
      }
    });
  }

  async promptPurchase(moduleName) {
    if (!this.currentUser) {
      alert('Please sign in to purchase modules!');
      // Show login modal
      if (window.userSystem) {
        window.userSystem.showLoginModal();
      }
      return;
    }

    const confirmed = confirm(`Purchase ${moduleName} for 500 jamnutz?`);
    if (confirmed) {
      const result = await this.purchaseModule(moduleName);
      if (result.success) {
        alert(`🎉 You now own ${moduleName}!`);
        this.userModules.add(moduleName);
        this.updateAllModuleImages();
      } else {
        alert(result.error || 'Purchase failed');
      }
    }
  }

  async purchaseModule(moduleName) {
    try {
      // This would call your purchase API
      if (window.secureAuth) {
        return await window.secureAuth.purchaseModule(moduleName, 500);
      }
      return { success: false, error: 'Purchase system not available' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Prevent right-click on owned modules
  initProtection() {
    // Disable right-click on module images
    document.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.module-owned')) {
        e.preventDefault();
        return false;
      }
    });

    // Disable drag
    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('.module-owned img')) {
        e.preventDefault();
        return false;
      }
    });

    // Add CSS protection
    const style = document.createElement('style');
    style.textContent = `
      .module-owned img {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        user-drag: none;
      }
      
      .module-locked {
        position: relative;
        cursor: pointer;
      }
      
      .lock-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        backdrop-filter: blur(2px);
        transition: all 0.3s;
      }
      
      .lock-overlay:hover {
        background: rgba(0, 0, 0, 0.8);
      }
      
      .lock-icon {
        font-size: 2rem;
        margin-bottom: 10px;
      }
      
      .lock-price {
        font-size: 1.2rem;
        font-weight: bold;
        color: #FFD700;
      }
      
      .module-owned.animated img {
        animation: moduleGlow 3s infinite;
      }
      
      @keyframes moduleGlow {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.1); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize the secure module system
const moduleSystem = new SecureModuleSystem();
moduleSystem.initProtection();

// Export for use in other files
window.secureModules = moduleSystem;

export default moduleSystem;