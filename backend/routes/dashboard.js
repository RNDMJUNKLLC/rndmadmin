const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, (req, res) => {
    // Mock dashboard statistics
    const stats = {
        users: {
            total: 1247,
            new_today: 23,
            active_sessions: 156,
            change_percentage: 12.5,
            trend: 'up'
        },
        revenue: {
            total: 24580,
            currency: 'USD',
            daily_average: 820,
            change_percentage: 8.2,
            trend: 'up'
        },
        orders: {
            total: 892,
            pending: 45,
            completed: 847,
            change_percentage: -3.1,
            trend: 'down'
        },
        system: {
            uptime_percentage: 99.9,
            response_time_ms: 127,
            error_rate: 0.001,
            change_percentage: 0.1,
            trend: 'stable'
        }
    };
    
    res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
    });
});

// GET /api/dashboard/activity
router.get('/activity', authenticateToken, (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    
    // Mock recent activity data
    const activities = [
        {
            id: 1,
            type: 'user_registered',
            icon: 'fa-user-plus',
            title: 'New user registered',
            description: 'john.doe@example.com signed up',
            timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            severity: 'info'
        },
        {
            id: 2,
            type: 'order_completed',
            icon: 'fa-shopping-cart',
            title: 'Order completed',
            description: 'Order #1247 - $127.50',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            severity: 'success'
        },
        {
            id: 3,
            type: 'system_update',
            icon: 'fa-cog',
            title: 'System settings updated',
            description: 'Email notification settings modified',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            severity: 'info'
        },
        {
            id: 4,
            type: 'error_alert',
            icon: 'fa-exclamation-triangle',
            title: 'API rate limit warning',
            description: 'High request volume detected',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            severity: 'warning'
        },
        {
            id: 5,
            type: 'backup_completed',
            icon: 'fa-database',
            title: 'Database backup completed',
            description: 'Weekly backup finished successfully',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            severity: 'success'
        },
        {
            id: 6,
            type: 'user_login',
            icon: 'fa-sign-in-alt',
            title: 'Admin login',
            description: 'Administrator signed in',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            severity: 'info'
        }
    ];
    
    res.json({
        success: true,
        data: activities.slice(0, limit),
        total: activities.length,
        timestamp: new Date().toISOString()
    });
});

// GET /api/dashboard/charts/revenue
router.get('/charts/revenue', authenticateToken, (req, res) => {
    const days = parseInt(req.query.days) || 30;
    
    // Mock revenue chart data
    const chartData = {
        labels: [],
        datasets: [{
            label: 'Daily Revenue',
            data: [],
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true
        }]
    };
    
    // Generate mock data for the last N days
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartData.labels.push(date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        }));
        chartData.datasets[0].data.push(Math.floor(Math.random() * 2000) + 500);
    }
    
    res.json({
        success: true,
        data: chartData,
        period: `${days} days`,
        timestamp: new Date().toISOString()
    });
});

// GET /api/dashboard/charts/users
router.get('/charts/users', authenticateToken, (req, res) => {
    const period = req.query.period || 'week';
    
    // Mock user growth chart data
    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'New Users',
            data: [12, 19, 8, 15, 26, 14, 23],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true
        }]
    };
    
    if (period === 'month') {
        chartData.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        chartData.datasets[0].data = [95, 123, 87, 156];
    }
    
    res.json({
        success: true,
        data: chartData,
        period: period,
        timestamp: new Date().toISOString()
    });
});

// GET /api/dashboard/overview
router.get('/overview', authenticateToken, (req, res) => {
    const overview = {
        system_health: {
            status: 'healthy',
            cpu_usage: 23.5,
            memory_usage: 67.2,
            disk_usage: 45.8,
            network_latency: 12
        },
        recent_alerts: [
            {
                level: 'warning',
                message: 'High CPU usage detected on server-02',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                level: 'info',
                message: 'Backup completed successfully',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
        ],
        quick_stats: {
            active_users: 156,
            pending_orders: 23,
            unread_messages: 8,
            system_alerts: 2
        },
        performance_metrics: {
            api_response_time: 127,
            database_query_time: 45,
            error_rate: 0.001,
            success_rate: 99.999
        }
    };
    
    res.json({
        success: true,
        data: overview,
        timestamp: new Date().toISOString()
    });
});

// POST /api/dashboard/export
router.post('/export', authenticateToken, (req, res) => {
    const { type, format, date_range } = req.body;
    
    // Mock export functionality
    setTimeout(() => {
        res.json({
            success: true,
            export_id: `exp_${Date.now()}`,
            download_url: `/api/dashboard/download/exp_${Date.now()}`,
            file_name: `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`,
            size_bytes: Math.floor(Math.random() * 1000000) + 100000,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            message: `${type} data exported successfully in ${format} format`
        });
    }, 1000);
});

// GET /api/dashboard/notifications
router.get('/notifications', authenticateToken, (req, res) => {
    const unread_only = req.query.unread_only === 'true';
    
    const notifications = [
        {
            id: 1,
            title: 'System maintenance scheduled',
            message: 'Scheduled maintenance tonight from 2:00 AM to 4:00 AM UTC',
            type: 'info',
            read: false,
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            title: 'Backup completed',
            message: 'Daily backup completed successfully. 2.3GB archived.',
            type: 'success',
            read: false,
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            title: 'High CPU usage alert',
            message: 'Server CPU usage has exceeded 80% threshold',
            type: 'warning',
            read: true,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    const filtered = unread_only ? 
        notifications.filter(n => !n.read) : 
        notifications;
    
    res.json({
        success: true,
        data: filtered,
        unread_count: notifications.filter(n => !n.read).length,
        total: notifications.length,
        timestamp: new Date().toISOString()
    });
});

// PUT /api/dashboard/notifications/:id/mark-read
router.put('/notifications/:id/mark-read', authenticateToken, (req, res) => {
    const notificationId = parseInt(req.params.id);
    
    // Mock marking notification as read
    res.json({
        success: true,
        message: `Notification ${notificationId} marked as read`,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;