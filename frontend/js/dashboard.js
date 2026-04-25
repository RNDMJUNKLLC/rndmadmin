// Dashboard functionality
//
// Boot sequence:
//   1. auth-guard.js (module) verifies the user is signed in with admin claim
//      and sets window.__rndmAuth + window.__rndmAuthReady.
//   2. We wait for BOTH that flag and DOMContentLoaded before booting.
//   3. Circuit breaker: if we've reloaded this page > 3 times in 30s, we stop
//      and surface an error instead of redirecting again. Prevents auth
//      loops from making the dashboard unusable.

(function bootGuard() {
    // Circuit breaker — detect runaway reload loops.
    try {
        const now = Date.now();
        const key = 'rndm_boot_history';
        const history = JSON.parse(sessionStorage.getItem(key) || '[]')
            .filter((t) => now - t < 30000);
        history.push(now);
        sessionStorage.setItem(key, JSON.stringify(history));
        if (history.length > 4) {
            console.error('Detected dashboard reload loop — halting.');
            sessionStorage.removeItem(key);
            document.documentElement.innerHTML =
                '<div style="font-family:Inter,sans-serif;padding:40px;max-width:560px;margin:60px auto;background:#fff;border-radius:12px;color:#111;"><h2>Auth loop detected</h2><p>The dashboard kept reloading. Sign out and try again.</p><p><button onclick="sessionStorage.clear();localStorage.clear();location.replace(\'login.html\')" style="background:#ef4444;color:#fff;border:0;padding:10px 18px;border-radius:6px;cursor:pointer;">Clear session &amp; go to login</button></p></div>';
            return;
        }
    } catch (e) { /* ignore storage errors */ }

    function whenAuthReady() {
        if (window.__rndmAuthReady && window.__rndmAuth) return Promise.resolve(window.__rndmAuth);
        return new Promise((resolve) => {
            const onReady = () => resolve(window.__rndmAuth);
            document.addEventListener('rndm:auth-ready', onReady, { once: true });
            // Poll fallback in case the event already fired before we attached.
            const poll = setInterval(() => {
                if (window.__rndmAuthReady && window.__rndmAuth) {
                    clearInterval(poll);
                    document.removeEventListener('rndm:auth-ready', onReady);
                    resolve(window.__rndmAuth);
                }
            }, 100);
        });
    }

    function whenDomReady() {
        if (document.readyState !== 'loading') return Promise.resolve();
        return new Promise((r) => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }

    Promise.all([whenAuthReady(), whenDomReady()]).then(([auth]) => {
        if (!auth || !auth.isAdmin) return; // auth-guard.js will have redirected
        bootDashboard();
    });
})();

function bootDashboard() {
    initializeDashboard();
    setupEventListeners();
    loadDashboardData();
}

function checkAuthentication() {
    // Auth is enforced by auth-guard.js; this is just a getter for legacy callers.
    return window.__rndmAuth && window.__rndmAuth.isAdmin === true;
}

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
        'website': 'Website Management',
        'analytics': 'Analytics',
        'ads': 'Ads & AdSense',
        'budget': 'Budget & Revenue',
        'projects': 'Projects',
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

async function updateStats() {
    // Load real statistics from Firebase
    try {
        // This will be populated by the firebase-rest module
        // For now, stats remain at 0 until data is available
        const stats = {
            leads: { value: 0, change: 0, trend: 'neutral' },
            revenue: { value: 0, change: 0, trend: 'neutral' },
            expenses: { value: 0, change: 0, trend: 'neutral' },
            profit: { value: 0, change: 0, trend: 'neutral' }
        };
        
        // Update overview stat cards
        updateStatElement('overview-total-leads', stats.leads.value);
        updateStatElement('overview-revenue', `$${stats.revenue.value.toLocaleString()}`);
        updateStatElement('overview-expenses', `$${stats.expenses.value.toLocaleString()}`);
        updateStatElement('overview-profit', `$${stats.profit.value.toLocaleString()}`);
        
        // Update change indicators
        updateChangeElement('overview-leads-change', stats.leads.change, stats.leads.trend);
        updateChangeElement('overview-revenue-change', stats.revenue.change, stats.revenue.trend);
        updateChangeElement('overview-expenses-change', stats.expenses.change, stats.expenses.trend);
        updateChangeElement('overview-profit-change', stats.profit.change, stats.profit.trend);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateChangeElement(id, change, trend) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = change ? `${change > 0 ? '+' : ''}${change}%` : '-';
        element.className = `stat-change ${trend}`;
    }
}

async function updateRecentActivity() {
    // Load real activity data from Firebase
    try {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;
        
        // This will be populated by actual events from Firebase
        // For now, show empty state
        activityList.innerHTML = `
            <div class="activity-item">
                <div class="activity-content" style="text-align: center; color: #999; padding: 20px;">
                    <p>No recent activity</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading recent activity:', error);
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
    // Load real notifications from Firebase
    const notifications = [];
    
    const content = `
        <div class="notifications-list">
            ${notifications.length === 0 ? 
                '<p style="text-align: center; color: #999; padding: 20px;">No notifications</p>' :
                notifications.map(notif => `
                    <div class="notification-item ${notif.type}">
                        <div class="notification-content">
                            <p>${notif.message}</p>
                            <span class="notification-time">${notif.time}</span>
                        </div>
                    </div>
                `).join('')
            }
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
    showNotification('Signing out...', 'info');
    if (window.__rndmAuth && typeof window.__rndmAuth.logout === 'function') {
        window.__rndmAuth.logout()
            .catch((err) => console.error('Sign-out error:', err))
            .finally(() => { window.location.replace('login.html'); });
    } else {
        window.location.replace('login.html');
    }
}

// Export functions for use in other scripts
window.logout = logout;