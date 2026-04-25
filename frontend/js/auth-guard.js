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
  // Single-flight redirect — onAuthChanged can fire after we've already
  // decided to redirect (e.g. our own logout()) and would otherwise cause
  // a second navigation that resets the loop counter on the login page.
  let redirected = false;
  const goLogin = (suffix = '') => {
    if (redirected) return;
    redirected = true;
    // Cache-bust to defeat any browser-cached 301 from the old _redirects.
    const sep = suffix.includes('?') ? '&' : '?';
    window.location.replace('login.html' + suffix + sep + 't=' + Date.now());
  };

  try {
    const user = await waitForAuthReady();
    if (!user) {
      goLogin();
      return;
    }
    const status = await getAdminStatus();
    if (!status.isAdmin) {
      console.warn('User does not have admin claim — signing out.');
      // Fire-and-forget logout; don't await — onAuthChanged below would
      // otherwise race the explicit redirect.
      logout().catch((e) => console.warn('logout failed:', e));
      goLogin('?error=not-admin');
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

    // If the user signs out elsewhere, kick them out — but only once.
    onAuthChanged((u) => {
      if (!u) goLogin('?error=session-expired');
    });

    document.dispatchEvent(new CustomEvent('rndm:auth-ready', { detail: status }));
  } catch (err) {
    console.error('Auth guard failure:', err);
    goLogin('?error=auth-error');
  }
})();
