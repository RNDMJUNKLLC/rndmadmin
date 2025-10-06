/**
 * Firebase Configuration
 * Secure Firebase configuration for RNDM Admin Dashboard
 */

// Firebase configuration for rndmform project
export const firebaseConfig = {
  apiKey: "AIzaSyA7Y2ppKIFumXd5aa7Lwj-263p-p1jiK7M",
  authDomain: "rndmform-56a7b.firebaseapp.com",
  databaseURL: "https://rndmform-56a7b-default-rtdb.firebaseio.com",
  projectId: "rndmform-56a7b",
  storageBucket: "rndmform-56a7b.appspot.com",
  messagingSenderId: "592358469137",
  appId: "1:592358469137:web:b2d18e70a70c4c42958bb0",
  measurementId: "G-FB38H9S3QC"
};

// Validation function
export function validateConfig() {
  const required = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config keys: ${missing.join(', ')}`);
  }
  
  return true;
}