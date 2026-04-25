/**
 * Firebase Auth Helper
 * Wraps the Firebase Auth modular SDK loaded from the gstatic CDN.
 * Exposes a small API used by login.js, dashboard.js and firebase-rest.js.
 *
 * Requires CSP to allow https://www.gstatic.com (script-src) and
 * https://*.googleapis.com (connect-src) — already configured in
 * frontend/_headers and src/worker.js.
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Make sure tokens survive a page reload
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.warn('Failed to set auth persistence:', err)
);

let cachedToken = null;
let cachedTokenExpiresAt = 0;

/**
 * Get a fresh ID token. Refreshes ~5 minutes before expiry.
 * @param {boolean} forceRefresh
 * @returns {Promise<string|null>}
 */
export async function getIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;

  const now = Date.now();
  if (!forceRefresh && cachedToken && now < cachedTokenExpiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  const tokenResult = await user.getIdTokenResult(forceRefresh);
  cachedToken = tokenResult.token;
  cachedTokenExpiresAt = new Date(tokenResult.expirationTime).getTime();
  return cachedToken;
}

/**
 * Returns the admin claim status of the current user.
 * @returns {Promise<{isAdmin: boolean, email: string|null, uid: string|null}>}
 */
export async function getAdminStatus() {
  const user = auth.currentUser;
  if (!user) return { isAdmin: false, email: null, uid: null };
  const tokenResult = await user.getIdTokenResult();
  return {
    isAdmin: tokenResult.claims.admin === true,
    email: user.email,
    uid: user.uid,
  };
}

/**
 * Sign in with email + password. Throws on failure.
 */
export async function signIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Force token refresh so we pick up the latest custom claims
  const tokenResult = await cred.user.getIdTokenResult(true);
  cachedToken = tokenResult.token;
  cachedTokenExpiresAt = new Date(tokenResult.expirationTime).getTime();
  return {
    user: cred.user,
    isAdmin: tokenResult.claims.admin === true,
  };
}

/**
 * Sign out and clear cached token.
 */
export async function logout() {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
  await signOut(auth);
}

/**
 * Wait for the initial auth state resolution.
 * @returns {Promise<import('firebase/auth').User|null>}
 */
export function waitForAuthReady() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

/**
 * Subscribe to auth state changes.
 * @param {(user: import('firebase/auth').User|null) => void} cb
 */
export function onAuthChanged(cb) {
  return onAuthStateChanged(auth, cb);
}

export { auth };
