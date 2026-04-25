/**
 * Login page logic — real Firebase Auth.
 * Loaded as a module so it can import firebase-auth.js
 */

import { signIn, waitForAuthReady, getAdminStatus } from './firebase-auth.js';

const loginForm = document.getElementById('loginForm');
const loginBtn = document.querySelector('.login-btn');
const emailInput = document.getElementById('email') || document.getElementById('username');
const passwordInput = document.getElementById('password');

// Password toggle
window.togglePassword = function () {
  const passwordIcon = document.getElementById('passwordIcon');
  if (!passwordInput || !passwordIcon) return;
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordIcon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    passwordIcon.classList.replace('fa-eye-slash', 'fa-eye');
  }
};

function setLoading(loading, label) {
  if (!loginBtn) return;
  const buttonText = loginBtn.querySelector('span');
  const buttonIcon = loginBtn.querySelector('i');
  if (loading) {
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    if (buttonText) buttonText.textContent = label || 'Signing In...';
    if (buttonIcon) {
      buttonIcon.classList.remove('fa-arrow-right');
      buttonIcon.classList.add('fa-spinner', 'fa-spin');
    }
  } else {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
    if (buttonText) buttonText.textContent = 'Sign In';
    if (buttonIcon) {
      buttonIcon.classList.remove('fa-spinner', 'fa-spin');
      buttonIcon.classList.add('fa-arrow-right');
    }
  }
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${
        type === 'success' ? 'fa-check-circle' :
        type === 'error' ? 'fa-exclamation-triangle' :
        type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'
      }"></i>
      <span></span>
    </div>
  `;
  // Use textContent to avoid HTML injection from error messages
  notification.querySelector('span').textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${
      type === 'success' ? '#10b981' :
      type === 'error' ? '#ef4444' :
      type === 'warning' ? '#f59e0b' : '#6366f1'
    };
    color: white; padding: 16px 20px; border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000;
    transform: translateX(120%); transition: transform 0.3s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 50);
  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => notification.remove(), 300);
  }, 3500);
}

function friendlyError(err) {
  const code = err && err.code ? err.code : '';
  switch (code) {
    case 'auth/invalid-email':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    default:
      return err && err.message ? err.message : 'Sign-in failed.';
  }
}

// Auto-redirect if already signed in as admin
(async () => {
  try {
    const user = await waitForAuthReady();
    if (!user) return;
    const { isAdmin } = await getAdminStatus();
    if (isAdmin) {
      showNotification('Already signed in. Redirecting...', 'info');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    }
  } catch (err) {
    console.warn('Auth ready check failed:', err);
  }
})();

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput && emailInput.value.trim();
    const password = passwordInput && passwordInput.value;

    if (!email || !password) {
      showNotification('Please enter your email and password.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const { isAdmin } = await signIn(email, password);
      if (!isAdmin) {
        showNotification('This account does not have admin access.', 'error');
        // Sign them back out so the dashboard guard isn't satisfied
        const { logout } = await import('./firebase-auth.js');
        await logout();
        setLoading(false);
        return;
      }
      showNotification('Login successful! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
    } catch (err) {
      console.error('Sign-in failed:', err);
      showNotification(friendlyError(err), 'error');
      setLoading(false);
    }
  });
}

// Subtle focus styling
document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('focus', () => input.parentElement?.classList.add('focused'));
  input.addEventListener('blur', () => input.parentElement?.classList.remove('focused'));
});
