// EURORACK.GRID Main App
// This is a TEST environment - NOT touching your real site!

import './firebase-config.js';

// Module data (using your existing WebP files)
const MODULES = [
    '00', 'Altered Black', 'Andersons', 'BAI',
    'Cephalopod Rose', 'Cephalopod', 'Complex Oscillator',
    'Function Synthesizer', 'Honduh', 'Mangler and Tangler',
    'Physical Modeler', 'textural Synthesizer', 'Varigated', 'Voltaged Gray'
];

// App State
let currentUser = null;
let userJamnutz = 0;
let ownedModules = [];
let currentRack = [];
let firebase = null;
let auth = null;
let db = null;

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎛️ EURORACK.GRID Test Environment Starting...');
    
    // Check if Firebase is configured
    if (window.DEMO_MODE) {
        console.log('📦 Running in DEMO MODE (no Firebase)');
        initDemoMode();
    } else {
        console.log('🔥 Connecting to Firebase...');
        await initFirebase();
    }
    
    // Set up UI
    setupTabs();
    setupModals();
    loadModules();
    setupRackBuilder();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1000);
});

// Demo Mode (works without Firebase)
function initDemoMode() {
    // Load demo data from localStorage
    currentUser = { email: 'demo@example.com', uid: 'demo123' };
    userJamnutz = parseInt(localStorage.getItem('demo_jamnutz') || '1000');
    ownedModules = JSON.parse(localStorage.getItem('demo_owned') || '[]');
    
    // Update UI
    document.getElementById('userDisplay').textContent = 'Demo Mode';
    document.getElementById('jamnutzBalance').textContent = userJamnutz;
    document.getElementById('authButton').style.display = 'none';
    
    updateInventoryStats();
}

// Firebase Initialization
async function initFirebase() {
    try {
        // Dynamic imports for Firebase
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { 
            getAuth, 
            onAuthStateChanged, 
            createUserWithEmailAndPassword, 
            signInWithEmailAndPassword,
            signInWithPopup,
            GoogleAuthProvider,
            signOut 
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { 
            getFirestore, 
            doc, 
            setDoc, 
            getDoc, 
            collection, 
            getDocs,
            updateDoc,
            serverTimestamp 
        } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        // Initialize Firebase
        const app = initializeApp(window.firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        
        // Store functions globally for use
        window.firebaseFunctions = {
            createUserWithEmailAndPassword,
            signInWithEmailAndPassword,
            signInWithPopup,
            GoogleAuthProvider,
            signOut,
            doc,
            setDoc,
            getDoc,
            updateDoc,
            serverTimestamp
        };
        
        // Auth state listener
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                document.getElementById('userDisplay').textContent = user.email;
                document.getElementById('authButton').textContent = 'Logout';
                await loadUserData(user.uid);
            } else {
                currentUser = null;
                document.getElementById('userDisplay').textContent = 'Not logged in';
                document.getElementById('authButton').textContent = 'Login';
                userJamnutz = 0;
                ownedModules = [];
                document.getElementById('jamnutzBalance').textContent = '0';
            }
            updateInventoryStats();
            loadModules();
        });
        
        console.log('✅ Firebase connected!');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        console.log('Falling back to demo mode');
        window.DEMO_MODE = true;
        initDemoMode();
    }
}

// Load user data from Firebase
async function loadUserData(uid) {
    if (!db) return;
    
    try {
        // Get user document
        const userDoc = await window.firebaseFunctions.getDoc(
            window.firebaseFunctions.doc(db, 'users', uid)
        );
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            userJamnutz = data.jamnutz_balance || 0;
        } else {
            // Create new user document
            await window.firebaseFunctions.setDoc(
                window.firebaseFunctions.doc(db, 'users', uid),
                {
                    email: currentUser.email,
                    jamnutz_balance: 1000, // Welcome bonus!
                    created_at: window.firebaseFunctions.serverTimestamp()
                }
            );
            userJamnutz = 1000;
        }
        
        // Get owned modules
        const ownershipCollection = collection(db, `ownership/${uid}/modules`);
        const ownershipDocs = await getDocs(ownershipCollection);
        ownedModules = [];
        ownershipDocs.forEach(doc => {
            ownedModules.push(doc.id);
        });
        
        document.getElementById('jamnutzBalance').textContent = userJamnutz;
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Tab Navigation
function setupTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + 'Tab').classList.add('active');
        });
    });
}

// Modal Setup
function setupModals() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    // Auth button
    document.getElementById('authButton').addEventListener('click', () => {
        if (currentUser) {
            // Logout
            if (confirm('Logout?')) {
                if (auth) {
                    window.firebaseFunctions.signOut(auth);
                } else {
                    // Demo logout
                    localStorage.clear();
                    location.reload();
                }
            }
        } else {
            // Show login modal
            document.getElementById('authModal').classList.add('active');
        }
    });
    
    // Auth form
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    
    // Auth toggle
    document.getElementById('authToggleBtn').addEventListener('click', () => {
        const isLogin = document.getElementById('authTitle').textContent === 'Welcome Back';
        document.getElementById('authTitle').textContent = isLogin ? 'Create Account' : 'Welcome Back';
        document.getElementById('authSubmitBtn').textContent = isLogin ? 'Sign Up' : 'Login';
        document.getElementById('authToggleText').textContent = isLogin ? 'Already have an account?' : "Don't have an account?";
        document.getElementById('authToggleBtn').textContent = isLogin ? 'Login' : 'Sign up';
    });
    
    // Google auth
    document.getElementById('googleAuthBtn').addEventListener('click', async () => {
        if (!auth) {
            alert('Firebase not configured. Please set up Firebase first.');
            return;
        }
        
        try {
            const provider = new window.firebaseFunctions.GoogleAuthProvider();
            await window.firebaseFunctions.signInWithPopup(auth, provider);
            document.getElementById('authModal').classList.remove('active');
        } catch (error) {
            alert('Google sign-in failed: ' + error.message);
        }
    });
}

// Handle authentication
async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const isLogin = document.getElementById('authTitle').textContent === 'Welcome Back';
    
    if (!auth) {
        // Demo mode
        currentUser = { email, uid: 'demo_' + Date.now() };
        document.getElementById('userDisplay').textContent = email;
        document.getElementById('authButton').textContent = 'Logout';
        document.getElementById('authModal').classList.remove('active');
        userJamnutz = 1000;
        document.getElementById('jamnutzBalance').textContent = userJamnutz;
        localStorage.setItem('demo_user', JSON.stringify(currentUser));
        return;
    }
    
    try {
        if (isLogin) {
            await window.firebaseFunctions.signInWithEmailAndPassword(auth, email, password);
        } else {
            await window.firebaseFunctions.createUserWithEmailAndPassword(auth, email, password);
        }
        document.getElementById('authModal').classList.remove('active');
    } catch (error) {
        alert(error.message);
    }
}

// Load modules in store
function loadModules() {
    const grid = document.getElementById('storeGrid');
    grid.innerHTML = '';
    
    MODULES.forEach(moduleName => {
        const owned = ownedModules.includes(moduleName);
        const card = document.createElement('div');
        card.className = 'module-card' + (owned ? ' owned' : '');
        
        // Using placeholder for now (will be WebP from your Supabase)
        const imageUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/${encodeURIComponent(moduleName)}.webp`;
        
        card.innerHTML = `
            <div class="module-image ${!owned ? 'locked' : ''}" 
                 style="background-image: url('${imageUrl}')"></div>
            <div class="module-info">
                <div class="module-name">${moduleName}</div>
                <div class="module-price">${owned ? '✅ Owned' : '🥜 500 / $5'}</div>
            </div>
        `;
        
        if (!owned) {
            card.addEventListener('click', () => showPurchaseModal(moduleName));
        }
        
        grid.appendChild(card);
    });
    
    updateInventory();
}

// Show purchase modal
function showPurchaseModal(moduleName) {
    if (!currentUser) {
        alert('Please login first!');
        document.getElementById('authModal').classList.add('active');
        return;
    }
    
    const modal = document.getElementById('purchaseModal');
    const imageUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/${encodeURIComponent(moduleName)}.webp`;
    
    document.getElementById('modalModuleName').textContent = moduleName;
    document.getElementById('modalImage').src = imageUrl;
    
    // Jamnutz purchase
    document.getElementById('buyWithJamnutz').onclick = async () => {
        if (userJamnutz >= 500) {
            await purchaseModule(moduleName, 'jamnutz');
            modal.classList.remove('active');
        } else {
            alert('Not enough jamnutz! You need 500 🥜');
        }
    };
    
    // Cash purchase (Stripe integration would go here)
    document.getElementById('buyWithCash').onclick = () => {
        alert('Stripe payment coming soon! Use jamnutz for now.');
    };
    
    modal.classList.add('active');
}

// Purchase module
async function purchaseModule(moduleName, method) {
    if (window.DEMO_MODE) {
        // Demo purchase
        if (method === 'jamnutz') {
            userJamnutz -= 500;
            localStorage.setItem('demo_jamnutz', userJamnutz);
        }
        ownedModules.push(moduleName);
        localStorage.setItem('demo_owned', JSON.stringify(ownedModules));
    } else if (db) {
        // Firebase purchase
        try {
            // Update jamnutz balance
            if (method === 'jamnutz') {
                await window.firebaseFunctions.updateDoc(
                    window.firebaseFunctions.doc(db, 'users', currentUser.uid),
                    { jamnutz_balance: userJamnutz - 500 }
                );
                userJamnutz -= 500;
            }
            
            // Add to ownership
            await window.firebaseFunctions.setDoc(
                window.firebaseFunctions.doc(db, `ownership/${currentUser.uid}/modules`, moduleName),
                {
                    purchased_at: window.firebaseFunctions.serverTimestamp(),
                    purchase_method: method
                }
            );
            
            ownedModules.push(moduleName);
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Purchase failed!');
            return;
        }
    }
    
    document.getElementById('jamnutzBalance').textContent = userJamnutz;
    alert(`✅ You now own ${moduleName}!`);
    loadModules();
    updateInventoryStats();
}

// Update inventory display
function updateInventory() {
    const grid = document.getElementById('inventoryGrid');
    
    if (ownedModules.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666;">No modules owned yet</div>';
        return;
    }
    
    grid.innerHTML = '';
    ownedModules.forEach(moduleName => {
        const card = document.createElement('div');
        card.className = 'module-card';
        
        const imageUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/${encodeURIComponent(moduleName)}.webp`;
        
        // Static (grayscale) in inventory
        card.innerHTML = `
            <div class="module-image" style="background-image: url('${imageUrl}'); filter: grayscale(50%)"></div>
            <div class="module-info">
                <div class="module-name">${moduleName}</div>
                <div class="module-price" style="color: #666">Not in rack</div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Update inventory stats
function updateInventoryStats() {
    document.getElementById('totalModules').textContent = ownedModules.length;
    document.getElementById('collectionValue').textContent = `$${ownedModules.length * 5}`;
    document.getElementById('racksBuilt').textContent = localStorage.getItem('racks_built') || '0';
}

// Rack Builder Setup
function setupRackBuilder() {
    const rackGrid = document.getElementById('rackGrid');
    const moduleTray = document.getElementById('moduleTray');
    
    // Create rack slots
    function createRackSlots() {
        const size = document.getElementById('rackSize').value;
        const rows = size === '3U' ? 1 : size === '6U' ? 2 : 3;
        const slots = rows * 6;
        
        rackGrid.innerHTML = '';
        rackGrid.dataset.size = size;
        
        for (let i = 0; i < slots; i++) {
            const slot = document.createElement('div');
            slot.className = 'rack-slot';
            slot.dataset.slot = i;
            slot.textContent = 'Empty';
            
            // Drag and drop
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });
            
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                
                const moduleName = e.dataTransfer.getData('module');
                if (moduleName && ownedModules.includes(moduleName)) {
                    // Module becomes animated when placed in rack!
                    const imageUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/${encodeURIComponent(moduleName)}.webp`;
                    slot.style.backgroundImage = `url('${imageUrl}')`;
                    slot.classList.add('filled');
                    slot.textContent = '';
                    slot.dataset.module = moduleName;
                    currentRack[i] = moduleName;
                }
            });
            
            rackGrid.appendChild(slot);
        }
    }
    
    // Update module tray
    function updateModuleTray() {
        moduleTray.innerHTML = '';
        
        if (ownedModules.length === 0) {
            moduleTray.innerHTML = '<div style="color: #666;">No modules owned yet</div>';
            return;
        }
        
        ownedModules.forEach(moduleName => {
            const module = document.createElement('div');
            module.className = 'draggable-module';
            module.draggable = true;
            module.title = moduleName;
            
            const imageUrl = `https://jqxshcyqxhbmvqrrthxy.supabase.co/storage/v1/object/public/euroracklegacywebp/${encodeURIComponent(moduleName)}.webp`;
            module.style.backgroundImage = `url('${imageUrl}')`;
            
            module.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('module', moduleName);
                module.classList.add('dragging');
            });
            
            module.addEventListener('dragend', () => {
                module.classList.remove('dragging');
            });
            
            moduleTray.appendChild(module);
        });
    }
    
    // Rack size change
    document.getElementById('rackSize').addEventListener('change', createRackSlots);
    document.getElementById('rackWidth').addEventListener('change', createRackSlots);
    
    // Clear rack
    document.getElementById('clearRack').addEventListener('click', () => {
        currentRack = [];
        createRackSlots();
    });
    
    // Save rack
    document.getElementById('saveRack').addEventListener('click', () => {
        const rackCount = parseInt(localStorage.getItem('racks_built') || '0') + 1;
        localStorage.setItem('racks_built', rackCount);
        localStorage.setItem(`rack_${rackCount}`, JSON.stringify(currentRack));
        alert('Rack saved!');
        updateInventoryStats();
    });
    
    // Power animations
    document.querySelectorAll('.power-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.dataset.effect;
            animateRack(effect);
        });
    });
    
    // Initialize
    createRackSlots();
    updateModuleTray();
    
    // Update when inventory changes
    setInterval(updateModuleTray, 1000);
}

// Rack power animations
function animateRack(effect) {
    const slots = document.querySelectorAll('.rack-slot.filled');
    
    if (slots.length === 0) {
        alert('Add modules to the rack first!');
        return;
    }
    
    slots.forEach((slot, index) => {
        setTimeout(() => {
            slot.style.transition = 'all 0.3s';
            
            if (effect === 'sequential') {
                slot.style.transform = 'scale(1.1)';
                slot.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8)';
            } else if (effect === 'wave') {
                slot.style.transform = 'translateY(-10px)';
                slot.style.filter = 'brightness(1.5)';
            } else if (effect === 'random') {
                const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                slot.style.boxShadow = `0 0 30px ${color}`;
                slot.style.borderColor = color;
            }
            
            setTimeout(() => {
                slot.style.transform = '';
                slot.style.filter = '';
                slot.style.boxShadow = '';
            }, 500);
        }, index * 100);
    });
}

// Filter modules
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            const cards = document.querySelectorAll('#storeGrid .module-card');
            
            cards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = '';
                } else if (filter === 'owned') {
                    card.style.display = card.classList.contains('owned') ? '' : 'none';
                } else if (filter === 'available') {
                    card.style.display = card.classList.contains('owned') ? 'none' : '';
                }
            });
        });
    });
});