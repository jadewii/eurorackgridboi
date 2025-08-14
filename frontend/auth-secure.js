// Secure Authentication System for EurorackGrid
// This replaces the localStorage demo with real Firebase auth

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration (will be injected from environment in production)
const firebaseConfig = {
  apiKey: "AIzaSyCYgsv4gIwqVMMT0RjqcI7CxNbKlfPR_Y",
  authDomain: "eurorackgrid.firebaseapp.com",
  projectId: "eurorackgrid",
  storageBucket: "eurorackgrid.firebasestorage.app",
  messagingSenderId: "194513784993",
  appId: "1:194513784993:web:7b5bd434794ac8f11260e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth state management
class SecureAuthSystem {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
    this.initAuthListener();
  }

  initAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUser = user;
        await this.loadUserProfile(user.uid);
        this.updateUI(true);
      } else {
        this.currentUser = null;
        this.userProfile = null;
        this.updateUI(false);
      }
    });
  }

  async signUp(email, password) {
    try {
      // Create auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        email: email,
        uid: user.uid,
        createdAt: serverTimestamp(),
        jamnutz: 1000, // Welcome bonus
        ownedModules: [],
        ownedRacks: ['cardboard-box'], // Free starter
        hasPowerSupply: false,
        hasCardboardBox: true,
        totalSpent: 0,
        lastLogin: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Update display name
      await updateProfile(user, {
        displayName: email.split('@')[0]
      });
      
      this.userProfile = userProfile;
      return { success: true, user: userProfile };
      
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  async signOutUser() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      return { success: false, error: error.message };
    }
  }

  async loadUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.userProfile = docSnap.data();
      } else {
        // Create profile if doesn't exist (shouldn't happen)
        const newProfile = {
          email: this.currentUser.email,
          uid: uid,
          createdAt: serverTimestamp(),
          jamnutz: 1000,
          ownedModules: [],
          ownedRacks: ['cardboard-box'],
          hasPowerSupply: false,
          hasCardboardBox: true,
          totalSpent: 0,
          lastLogin: serverTimestamp()
        };
        await setDoc(doc(db, 'users', uid), newProfile);
        this.userProfile = newProfile;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async purchaseModule(moduleName, price) {
    if (!this.currentUser || !this.userProfile) {
      return { success: false, error: 'Not logged in' };
    }
    
    if (this.userProfile.jamnutz < price) {
      return { success: false, error: 'Insufficient jamnutz' };
    }
    
    try {
      const userRef = doc(db, 'users', this.currentUser.uid);
      
      // Update user profile
      const newJamnutz = this.userProfile.jamnutz - price;
      const newModules = [...this.userProfile.ownedModules, moduleName];
      
      await updateDoc(userRef, {
        jamnutz: newJamnutz,
        ownedModules: newModules,
        totalSpent: (this.userProfile.totalSpent || 0) + price,
        lastPurchase: serverTimestamp()
      });
      
      // Check for power supply unlock
      if (newModules.length === 2 && !this.userProfile.hasPowerSupply) {
        await updateDoc(userRef, {
          hasPowerSupply: true
        });
        this.userProfile.hasPowerSupply = true;
      }
      
      // Update local profile
      this.userProfile.jamnutz = newJamnutz;
      this.userProfile.ownedModules = newModules;
      
      // Record transaction
      await this.recordTransaction('module_purchase', moduleName, price);
      
      return { success: true, newBalance: newJamnutz };
      
    } catch (error) {
      console.error('Purchase error:', error);
      return { success: false, error: error.message };
    }
  }

  async recordTransaction(type, item, amount) {
    try {
      const transaction = {
        userId: this.currentUser.uid,
        type: type,
        item: item,
        amount: amount,
        timestamp: serverTimestamp(),
        balance: this.userProfile.jamnutz
      };
      
      // Auto-generate ID for transaction
      const transactionRef = doc(collection(db, 'transactions'));
      await setDoc(transactionRef, transaction);
      
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: this.getErrorMessage(error.code)
      };
    }
  }

  getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'An error occurred. Please try again';
    }
  }

  updateUI(isLoggedIn) {
    // Update all UI elements that depend on auth state
    const event = new CustomEvent('authStateChanged', {
      detail: {
        isLoggedIn: isLoggedIn,
        user: this.currentUser,
        profile: this.userProfile
      }
    });
    window.dispatchEvent(event);
  }

  // Get current user data
  getCurrentUser() {
    return {
      user: this.currentUser,
      profile: this.userProfile
    };
  }
}

// Create and export singleton instance
const authSystem = new SecureAuthSystem();
window.secureAuth = authSystem;

export default authSystem;