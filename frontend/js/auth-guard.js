/**
 * Auth guard for the admin dashboard.
 * Runs before any data is fetched. If the visitor isn't signed in
 * with the `admin: true` custom claim, they are redirected to login.
 *
 * Exposes window.__rndmAuth = { user, isAdmin, getIdToken, logout }
 * and dispatches a 'rndm:auth-ready' event when ready.
 */

import {
  waitForAuthReady,
  getAdminStatus,
  getIdToken,
  logout,
  onAuthChanged,
} from './firebase-auth.js';

(async () => {
  try {
    const user = await waitForAuthReady();
    if (!user) {
      window.location.replace('login.html');
      return;
    }
    const status = await getAdminStatus();
    if (!status.isAdmin) {
      console.warn('User does not have admin claim — signing out.');
      await logout();
      window.location.replace('login.html?error=not-admin');
      return;
    }

    window.__rndmAuth = {
      user,
      isAdmin: true,
      email: user.email,
      uid: user.uid,
      getIdToken,
      logout,
    };
    window.__rndmAuthReady = true;

    // Update sidebar profile if present
    const nameEl = document.querySelector('.sidebar-footer .user-name');
    if (nameEl && user.displayName) nameEl.textContent = user.displayName;
    const roleEl = document.querySelector('.sidebar-footer .user-role');
    if (roleEl) roleEl.textContent = user.email || 'Administrator';

    // If the user signs out elsewhere, kick them out
    onAuthChanged((u) => {
      if (!u) window.location.replace('login.html');
    });

    document.dispatchEvent(new CustomEvent('rndm:auth-ready', { detail: status }));
  } catch (err) {
    console.error('Auth guard failure:', err);
    window.location.replace('login.html?error=auth-error');
  }
})();
