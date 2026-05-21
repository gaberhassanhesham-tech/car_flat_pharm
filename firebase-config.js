// Firebase configuration for Car Flat Pharm project
// تم إضافة إعدادات Firebase كما زودتني بها
const firebaseConfig = {
  apiKey: "AIzaSyDPh6Dt7UKk2SJWKrpNF_SxZ-eicGtPNEE",
  authDomain: "car-flat-pharm.firebaseapp.com",
  projectId: "car-flat-pharm",
  storageBucket: "car-flat-pharm.firebasestorage.app",
  messagingSenderId: "599204546085",
  appId: "1:599204546085:web:94b8c9fd74ab20134b61cc",
  measurementId: "G-0FGTE9PLK7"
};

// Expose on window for browser usage
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}

// Export for Node/CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = firebaseConfig;
}

// Also provide named export for ESM consumers (if supported)
try {
  // eslint-disable-next-line no-undef
  exports.firebaseConfig = firebaseConfig;
} catch (e) {
  // ignore
}
