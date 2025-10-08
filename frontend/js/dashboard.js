// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuthentication();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
});

function checkAuthentication() {
    // Temporarily skip authentication to debug loop
    console.log('Authentication check - setting temporary auth');
    localStorage.setItem('rndm_admin_logged_in', 'true');
    localStorage.setItem('rndm_admin_login_time', new Date().toISOString());
    
    // TODO: Implement proper authentication
    // const isLoggedIn = localStorage.getItem('rndm_admin_logged_in');
    // if (isLoggedIn !== 'true') {
    //     console.warn('User not authenticated - showing login prompt');
    //     showLoginPrompt();
    //     return;
    // }
    
    // Check session expiry
    const loginTime = localStorage.getItem('rndm_admin_login_time');
    if (loginTime) {
        const now = new Date();
        const loginDate = new Date(loginTime);
        const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            logout();
            return;
        }
    }
}

function showLoginPrompt() {
    // Create a simple in-page login prompt to avoid redirect loops
    const loginPrompt = document.createElement('div');
    loginPrompt.id = 'login-prompt';
    loginPrompt.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center;">
                <h2>Admin Access Required</h2>
                <p>Please authenticate to access the admin dashboard.</p>
                <button onclick="proceedWithoutAuth()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 8px;">
                    Continue Anyway (Demo Mode)
                </button>
                <button onclick="goToLogin()" style="background: #6b7280; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; margin: 8px;">
                    Go to Login
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(loginPrompt);
}

function proceedWithoutAuth() {
    // Set temporary auth for demo purposes
    localStorage.setItem('rndm_admin_logged_in', 'true');
    localStorage.setItem('rndm_admin_login_time', new Date().toISOString());
    document.getElementById('login-prompt')?.remove();
    location.reload();
}

function goToLogin() {
    // Only redirect if explicitly requested
    window.location.href = 'login.html';
}

// Make functions globally accessible
window.proceedWithoutAuth = proceedWithoutAuth;
window.goToLogin = goToLogin;

function initializeDashboard() {
    // Set up sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Save sidebar state
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('rndm_sidebar_collapsed', isCollapsed);
    });
    
    // Restore sidebar state
    const isCollapsed = localStorage.getItem('rndm_sidebar_collapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
    
    // Set up mobile menu
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    mobileMenuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
        mobileOverlay.classList.toggle('active');
    });
    
    mobileOverlay.addEventListener('click', function() {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    });
}

function setupEventListeners() {
    // Menu item clicks
    const menuItems = document.querySelectorAll('.menu-item[data-view]');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const viewName = this.getAttribute('data-view');
            switchView(viewName);
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            const sidebar = document.getElementById('sidebar');
            const mobileOverlay = document.getElementById('mobileOverlay');
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
        });
    });
    
    // Quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            handleQuickAction(action);
        });
    });
    
    // Header buttons
    const headerBtns = document.querySelectorAll('.header-btn');
    headerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            handleHeaderAction(title);
        });
    });
}

function switchView(viewName) {
    // Hide all views
    const views = document.querySelectorAll('.view-container');
    views.forEach(view => view.classList.remove('active'));
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        'overview': 'Overview',
        'analytics': 'Analytics',
        'users': 'Users',
        'content': 'Content',
        'settings': 'Settings',
        'logs': 'System Logs',
        'database': 'Database',
        'api': 'API Monitor'
    };
    
    pageTitle.textContent = titles[viewName] || 'Dashboard';
    
    // Load view-specific data
    loadViewData(viewName);
    
    // Load management module views
    if (viewName === 'users' && window.managementModule) {
        window.managementModule.loadUsers();
    } else if (viewName === 'content' && window.managementModule) {
        window.managementModule.loadContent();
    } else if (viewName === 'settings' && window.managementModule) {
        window.managementModule.loadSettings();
    }
}

function loadDashboardData() {
    // Simulate loading dashboard statistics
    updateStats();
    updateRecentActivity();
    updateSystemStatus();
}

function updateStats() {
    // This would typically fetch real data from your API
    const stats = {
        users: { value: 1247, change: 12, trend: 'positive' },
        revenue: { value: '$24,580', change: 8.2, trend: 'positive' },
        orders: { value: 892, change: -3.1, trend: 'negative' },
        uptime: { value: '99.9%', change: 0.1, trend: 'neutral' }
    };
    
    // Update stat cards with animation
    Object.keys(stats).forEach(key => {
        const stat = stats[key];
        // Add animation logic here if needed
    });
}

function updateRecentActivity() {
    // This would typically fetch real activity data
    const activities = [
        { icon: 'fa-user-plus', text: 'New user registered', time: '2 minutes ago' },
        { icon: 'fa-shopping-cart', text: 'Order #1247 completed', time: '15 minutes ago' },
        { icon: 'fa-cog', text: 'System settings updated', time: '1 hour ago' }
    ];
    
    // Update activity list
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        // Update with real data
    }
}

function updateSystemStatus() {
    // Monitor system health
    const status = {
        database: 'healthy',
        api: 'healthy',
        server: 'healthy'
    };
    
    // Update status indicators
}

function loadViewData(viewName) {
    switch(viewName) {
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'content':
            loadContentData();
            break;
        case 'logs':
            loadLogsData();
            break;
        case 'database':
            loadDatabaseData();
            break;
        case 'api':
            loadApiData();
            break;
        default:
            // Overview is already loaded
            break;
    }
}

function loadAnalyticsData() {
    // Load analytics charts and data
    console.log('Loading analytics data...');
    // Implement chart loading logic here
}

function loadUsersData() {
    // Load user management data
    console.log('Loading users data...');
    // Implement user table loading logic here
}

function loadContentData() {
    // Load content management data
    console.log('Loading content data...');
    // Implement content loading logic here
}

function loadLogsData() {
    // Load system logs
    console.log('Loading logs data...');
    // Implement log loading logic here
}

function loadDatabaseData() {
    // Load database information
    console.log('Loading database data...');
    // Implement database monitoring logic here
}

function loadApiData() {
    // Load API monitoring data
    console.log('Loading API data...');
    // Implement API monitoring logic here
}

function handleQuickAction(action) {
    switch(action) {
        case 'Add User':
            showModal('Add New User', createUserForm());
            break;
        case 'Create Post':
            showModal('Create New Post', createPostForm());
            break;
        case 'Send Email':
            showModal('Send Email', createEmailForm());
            break;
        case 'Export Data':
            exportData();
            break;
        default:
            console.log(`Quick action: ${action}`);
    }
}

function handleHeaderAction(action) {
    switch(action) {
        case 'Notifications':
            showNotifications();
            break;
        case 'Search':
            showSearchModal();
            break;
        case 'Settings':
            switchView('settings');
            break;
        default:
            console.log(`Header action: ${action}`);
    }
}

function showModal(title, content) {
    // Create and show modal dialog
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;
    
    // Add modal styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function createUserForm() {
    return `
        <form class="modal-form">
            <div class="form-group">
                <label>Username:</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" name="email" required>
            </div>
            <div class="form-group">
                <label>Role:</label>
                <select name="role">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <button type="submit" class="btn-primary">Add User</button>
        </form>
    `;
}

function createPostForm() {
    return `
        <form class="modal-form">
            <div class="form-group">
                <label>Title:</label>
                <input type="text" name="title" required>
            </div>
            <div class="form-group">
                <label>Content:</label>
                <textarea name="content" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn-primary">Create Post</button>
        </form>
    `;
}

function createEmailForm() {
    return `
        <form class="modal-form">
            <div class="form-group">
                <label>To:</label>
                <input type="email" name="to" required>
            </div>
            <div class="form-group">
                <label>Subject:</label>
                <input type="text" name="subject" required>
            </div>
            <div class="form-group">
                <label>Message:</label>
                <textarea name="message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn-primary">Send Email</button>
        </form>
    `;
}

function showNotifications() {
    const notifications = [
        { type: 'info', message: 'System maintenance scheduled for tonight', time: '10 minutes ago' },
        { type: 'success', message: 'Backup completed successfully', time: '1 hour ago' },
        { type: 'warning', message: 'High CPU usage detected', time: '2 hours ago' }
    ];
    
    const content = `
        <div class="notifications-list">
            ${notifications.map(notif => `
                <div class="notification-item ${notif.type}">
                    <div class="notification-content">
                        <p>${notif.message}</p>
                        <span class="notification-time">${notif.time}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    showModal('Notifications', content);
}

function showSearchModal() {
    const content = `
        <div class="search-modal">
            <input type="text" placeholder="Search dashboard..." class="search-input">
            <div class="search-results">
                <div class="search-category">
                    <h4>Quick Actions</h4>
                    <div class="search-item">Add User</div>
                    <div class="search-item">Create Post</div>
                </div>
                <div class="search-category">
                    <h4>Pages</h4>
                    <div class="search-item">Analytics</div>
                    <div class="search-item">User Management</div>
                </div>
            </div>
        </div>
    `;
    
    showModal('Search', content);
}

function exportData() {
    // Simulate data export
    showNotification('Exporting data...', 'info');
    
    setTimeout(() => {
        showNotification('Data exported successfully!', 'success');
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-triangle';
        case 'warning': return 'fa-exclamation-circle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#6366f1';
    }
}

function logout() {
    // Clear session data
    localStorage.removeItem('rndm_admin_logged_in');
    localStorage.removeItem('rndm_admin_login_time');
    localStorage.removeItem('rndm_admin_token');
    
    // Show logout message
    showNotification('Logging out...', 'info');
    
    // Show login prompt instead of redirecting
    setTimeout(() => {
        showLoginPrompt();
    }, 1000);
}

// Export functions for use in other scripts
window.logout = logout;