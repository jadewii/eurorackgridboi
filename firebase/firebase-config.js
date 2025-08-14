// FIREBASE CONFIGURATION
// This config is for the eurorack-grid Firebase project

const firebaseConfig = {
  apiKey: "AIzaSyCYgsv4gIwqVMMT0RjqcI7CxNbKlfPR_Y",
  authDomain: "eurorackgrid.firebaseapp.com",
  projectId: "eurorackgrid",
  storageBucket: "eurorackgrid.firebasestorage.app",
  messagingSenderId: "194513784993",
  appId: "1:194513784993:web:7b5bd434794ac8f11260e0",
  measurementId: "G-2MHFZJLM16"
};

// ============================================
// FIREBASE IS NOW CONNECTED!
// ============================================

console.log("✅ Firebase configured for EurorackGrid!");
window.DEMO_MODE = false;
window.firebaseConfig = firebaseConfig;