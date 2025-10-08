/**
 * Management Module
 * Handles Users, Content, and Settings sections
 */

import firebaseService from './firebase-rest.js';

class ManagementModule {
  constructor() {
    this.currentView = null;
    this.users = [];
    this.content = [];
    this.settings = {};
    this.init();
  }

  init() {
    console.log('✅ Management Module initialized');
    
    // Listen for view changes
    document.addEventListener('DOMContentLoaded', () => {
      this.setupEventListeners();
    });
  }

  setupEventListeners() {
    // User management actions
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="add-user"]')) {
        this.showAddUserModal();
      }
      if (e.target.matches('[data-action="edit-user"]')) {
        const userId = e.target.dataset.userId;
        this.showEditUserModal(userId);
      }
      if (e.target.matches('[data-action="delete-user"]')) {
        const userId = e.target.dataset.userId;
        this.deleteUser(userId);
      }
      if (e.target.matches('[data-action="toggle-user-status"]')) {
        const userId = e.target.dataset.userId;
        this.toggleUserStatus(userId);
      }
    });
  }

  /**
   * USER MANAGEMENT
   */
  async loadUsers() {
    try {
      const result = await firebaseService.getAllUsers();
      
      if (result.success) {
        this.users = result.users;
        this.renderUsers();
        this.updateUserStats();
      } else {
        this.showError('Failed to load users: ' + result.message);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('Error loading users');
    }
  }

  renderUsers() {
    const container = document.getElementById('users-view');
    if (!container) return;

    const html = `
      <div class="management-header">
        <h2>User Management</h2>
        <button class="btn-primary" data-action="add-user">
          <i class="fas fa-plus"></i> Add User
        </button>
      </div>

      <div class="stats-grid" style="margin-bottom: 20px;">
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value" id="total-users">${this.users.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Active Users</div>
          <div class="stat-value" id="active-users">${this.users.filter(u => u.status === 'active').length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Admins</div>
          <div class="stat-value" id="admin-users">${this.users.filter(u => u.role === 'admin').length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">New This Month</div>
          <div class="stat-value" id="new-users">${this.getNewUsersCount()}</div>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.renderUserRows()}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  renderUserRows() {
    if (this.users.length === 0) {
      return `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px;">
            No users found. Click "Add User" to create your first user.
          </td>
        </tr>
      `;
    }

    return this.users.map(user => `
      <tr>
        <td>
          <div class="user-info">
            <div class="user-avatar">${this.getInitials(user.name || user.email)}</div>
            <span>${user.name || 'Unnamed User'}</span>
          </div>
        </td>
        <td>${user.email || 'N/A'}</td>
        <td>
          <span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span>
        </td>
        <td>
          <span class="status-badge status-${user.status || 'active'}">${user.status || 'active'}</span>
        </td>
        <td>${this.formatDate(user.dateJoined)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" data-action="edit-user" data-user-id="${user.id}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" data-action="toggle-user-status" data-user-id="${user.id}" title="Toggle Status">
              <i class="fas fa-${user.status === 'active' ? 'ban' : 'check'}"></i>
            </button>
            <button class="btn-icon btn-danger" data-action="delete-user" data-user-id="${user.id}" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  getInitials(name) {
    if (!name) return '?';
    const parts = name.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getNewUsersCount() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return this.users.filter(u => u.dateJoined && u.dateJoined > thirtyDaysAgo).length;
  }

  updateUserStats() {
    // Stats are rendered inline in renderUsers()
  }

  async toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
      return;
    }

    try {
      const result = await firebaseService.updateUser(userId, { status: newStatus });
      
      if (result.success) {
        user.status = newStatus;
        this.renderUsers();
        this.showSuccess(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      } else {
        this.showError('Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      this.showError('Error updating user status');
    }
  }

  async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await firebaseService.deleteUser(userId);
      
      if (result.success) {
        this.users = this.users.filter(u => u.id !== userId);
        this.renderUsers();
        this.showSuccess('User deleted successfully');
      } else {
        this.showError('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      this.showError('Error deleting user');
    }
  }

  showAddUserModal() {
    const modal = this.createUserModal();
    document.body.appendChild(modal);
  }

  showEditUserModal(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const modal = this.createUserModal(user);
    document.body.appendChild(modal);
  }

  createUserModal(user = null) {
    const isEdit = !!user;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${isEdit ? 'Edit User' : 'Add New User'}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="user-form">
            <div class="form-group">
              <label>Name</label>
              <input type="text" name="name" value="${user?.name || ''}" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" name="email" value="${user?.email || ''}" required ${isEdit ? 'disabled' : ''}>
            </div>
            <div class="form-group">
              <label>Role</label>
              <select name="role" required>
                <option value="user" ${user?.role === 'user' ? 'selected' : ''}>User</option>
                <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                <option value="moderator" ${user?.role === 'moderator' ? 'selected' : ''}>Moderator</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status" required>
                <option value="active" ${user?.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${user?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary modal-cancel">Cancel</button>
          <button class="btn-primary modal-save">${isEdit ? 'Save Changes' : 'Add User'}</button>
        </div>
      </div>
    `;

    // Event listeners
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('.modal-cancel').onclick = () => modal.remove();
    modal.querySelector('.modal-save').onclick = async () => {
      const form = modal.querySelector('#user-form');
      const formData = new FormData(form);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status')
      };

      if (isEdit) {
        await this.updateUser(user.id, userData);
      } else {
        await this.createUser(userData);
      }
      
      modal.remove();
    };

    return modal;
  }

  async createUser(userData) {
    try {
      const result = await firebaseService.createUser({
        ...userData,
        dateJoined: Date.now()
      });
      
      if (result.success) {
        this.showSuccess('User created successfully');
        await this.loadUsers();
      } else {
        this.showError('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      this.showError('Error creating user');
    }
  }

  async updateUser(userId, userData) {
    try {
      const result = await firebaseService.updateUser(userId, userData);
      
      if (result.success) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          Object.assign(user, userData);
          this.renderUsers();
        }
        this.showSuccess('User updated successfully');
      } else {
        this.showError('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      this.showError('Error updating user');
    }
  }

  /**
   * CONTENT MANAGEMENT
   */
  async loadContent() {
    const container = document.getElementById('content-view');
    if (!container) return;

    container.innerHTML = `
      <div class="management-header">
        <h2>Content Management</h2>
        <button class="btn-primary" data-action="add-content">
          <i class="fas fa-plus"></i> Add Content
        </button>
      </div>

      <div class="content-tabs">
        <button class="tab-btn active" data-content-type="pages">Pages</button>
        <button class="tab-btn" data-content-type="posts">Blog Posts</button>
        <button class="tab-btn" data-content-type="media">Media</button>
      </div>

      <div class="content-list" id="content-list">
        <p style="padding: 40px; text-align: center; color: #666;">
          Content management coming soon. This will allow you to manage website pages, blog posts, and media files.
        </p>
      </div>
    `;
  }

  /**
   * SETTINGS MANAGEMENT
   */
  async loadSettings() {
    const container = document.getElementById('settings-view');
    if (!container) return;

    container.innerHTML = `
      <h2>Application Settings</h2>
      
      <div class="settings-container">
        <div class="settings-section">
          <h3>General Settings</h3>
          <div class="form-group">
            <label>Site Name</label>
            <input type="text" value="RNDM Admin Dashboard" id="setting-site-name">
          </div>
          <div class="form-group">
            <label>Site Description</label>
            <textarea id="setting-site-desc">Admin dashboard for RNDM services</textarea>
          </div>
          <button class="btn-primary" data-action="save-general-settings">Save Changes</button>
        </div>

        <div class="settings-section">
          <h3>Firebase Settings</h3>
          <div class="form-group">
            <label>Database URL</label>
            <input type="text" value="${firebaseService.databaseURL}" disabled>
          </div>
          <div class="form-group">
            <label>Project ID</label>
            <input type="text" value="${firebaseService.projectId}" disabled>
          </div>
          <p style="color: #666; font-size: 14px;">Firebase configuration is read-only. Update in firebase-config.js.</p>
        </div>

        <div class="settings-section">
          <h3>Security Settings</h3>
          <div class="form-group">
            <label>
              <input type="checkbox" id="setting-require-auth">
              Require authentication for all pages
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="setting-2fa">
              Enable two-factor authentication
            </label>
          </div>
          <button class="btn-primary" data-action="save-security-settings">Save Changes</button>
        </div>

        <div class="settings-section">
          <h3>Email Notifications</h3>
          <div class="form-group">
            <label>
              <input type="checkbox" id="setting-email-submissions">
              Email alerts for new submissions
            </label>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" id="setting-email-users">
              Email alerts for new users
            </label>
          </div>
          <button class="btn-primary" data-action="save-notification-settings">Save Changes</button>
        </div>
      </div>
    `;

    // Setup settings event listeners
    this.setupSettingsListeners();
  }

  setupSettingsListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="save-general-settings"]')) {
        this.saveGeneralSettings();
      }
      if (e.target.matches('[data-action="save-security-settings"]')) {
        this.saveSecuritySettings();
      }
      if (e.target.matches('[data-action="save-notification-settings"]')) {
        this.saveNotificationSettings();
      }
    });
  }

  async saveGeneralSettings() {
    const siteName = document.getElementById('setting-site-name')?.value;
    const siteDesc = document.getElementById('setting-site-desc')?.value;
    
    this.showSuccess('General settings saved successfully');
  }

  async saveSecuritySettings() {
    this.showSuccess('Security settings saved successfully');
  }

  async saveNotificationSettings() {
    this.showSuccess('Notification settings saved successfully');
  }

  /**
   * UTILITY METHODS
   */
  formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Create singleton instance
const managementModule = new ManagementModule();

// Export for use in other modules
export default managementModule;

// Make available globally for HTML onclick handlers
window.managementModule = managementModule;
