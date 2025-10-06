const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');

// Mock system logs
let systemLogs = [
    {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'auth',
        message: 'User login successful',
        details: { userId: 1, ip: '192.168.1.100' }
    },
    {
        id: 2,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        level: 'warning',
        category: 'system',
        message: 'High CPU usage detected',
        details: { cpu_percent: 85, threshold: 80 }
    },
    {
        id: 3,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        level: 'error',
        category: 'database',
        message: 'Database connection timeout',
        details: { timeout_ms: 5000, retry_count: 3 }
    },
    {
        id: 4,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        level: 'info',
        category: 'backup',
        message: 'Database backup completed',
        details: { size_mb: 2348, duration_ms: 45000 }
    }
];

// GET /api/system/logs
router.get('/logs', authenticateToken, (req, res) => {
    try {
        const level = req.query.level || 'all';
        const category = req.query.category || 'all';
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        
        let filteredLogs = [...systemLogs];
        
        // Filter by level
        if (level !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }
        
        // Filter by category
        if (category !== 'all') {
            filteredLogs = filteredLogs.filter(log => log.category === category);
        }
        
        // Sort by timestamp (newest first)
        filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);
        
        res.json({
            success: true,
            data: paginatedLogs,
            pagination: {
                current_page: page,
                per_page: limit,
                total_items: filteredLogs.length,
                total_pages: Math.ceil(filteredLogs.length / limit)
            },
            filters: { level, category },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to retrieve system logs'
        });
    }
});

// GET /api/system/health
router.get('/health', authenticateToken, (req, res) => {
    const health = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services: {
            database: {
                status: 'connected',
                response_time_ms: Math.floor(Math.random() * 50) + 10,
                connection_pool: {
                    active: 8,
                    idle: 12,
                    total: 20
                }
            },
            cache: {
                status: 'connected',
                hit_rate: 0.85,
                memory_usage_mb: 245,
                keys_count: 15670
            },
            external_apis: {
                payment_gateway: {
                    status: 'operational',
                    response_time_ms: Math.floor(Math.random() * 200) + 50
                },
                email_service: {
                    status: 'operational',
                    response_time_ms: Math.floor(Math.random() * 100) + 30
                }
            }
        },
        metrics: {
            cpu_usage: Math.floor(Math.random() * 30) + 10,
            memory_usage: Math.floor(Math.random() * 40) + 30,
            disk_usage: Math.floor(Math.random() * 20) + 40,
            network_io: {
                bytes_in: Math.floor(Math.random() * 1000000) + 500000,
                bytes_out: Math.floor(Math.random() * 800000) + 400000
            }
        }
    };
    
    res.json({
        success: true,
        data: health,
        timestamp: new Date().toISOString()
    });
});

// GET /api/system/metrics
router.get('/metrics', authenticateToken, (req, res) => {
    const period = req.query.period || 'hour';
    
    // Generate mock metrics data
    const generateDataPoints = (count, min, max) => {
        return Array.from({ length: count }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    };
    
    let dataPoints, labels;
    
    switch (period) {
        case 'hour':
            dataPoints = 12;
            labels = Array.from({ length: 12 }, (_, i) => `${i * 5}min`);
            break;
        case 'day':
            dataPoints = 24;
            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            break;
        case 'week':
            dataPoints = 7;
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
        default:
            dataPoints = 12;
            labels = Array.from({ length: 12 }, (_, i) => `${i * 5}min`);
    }
    
    const metrics = {
        cpu_usage: {
            data: generateDataPoints(dataPoints, 10, 80),
            average: 35,
            peak: 78
        },
        memory_usage: {
            data: generateDataPoints(dataPoints, 30, 90),
            average: 65,
            peak: 87
        },
        response_time: {
            data: generateDataPoints(dataPoints, 50, 500),
            average: 127,
            peak: 456
        },
        requests_per_second: {
            data: generateDataPoints(dataPoints, 10, 200),
            average: 85,
            peak: 189
        }
    };
    
    res.json({
        success: true,
        data: {
            labels,
            metrics
        },
        period,
        timestamp: new Date().toISOString()
    });
});

// GET /api/system/database
router.get('/database', authenticateToken, (req, res) => {
    const dbInfo = {
        connection_info: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'rndmadmin',
            ssl_enabled: process.env.DB_SSL === 'true'
        },
        statistics: {
            total_size_mb: 1847,
            tables_count: 12,
            indexes_count: 24,
            active_connections: 8,
            max_connections: 100
        },
        tables: [
            {
                name: 'users',
                row_count: 1247,
                size_mb: 245,
                last_updated: new Date(Date.now() - 15 * 60 * 1000).toISOString()
            },
            {
                name: 'sessions',
                row_count: 156,
                size_mb: 12,
                last_updated: new Date(Date.now() - 2 * 60 * 1000).toISOString()
            },
            {
                name: 'logs',
                row_count: 89456,
                size_mb: 1245,
                last_updated: new Date().toISOString()
            },
            {
                name: 'settings',
                row_count: 45,
                size_mb: 2,
                last_updated: new Date(Date.now() - 60 * 60 * 1000).toISOString()
            }
        ],
        performance: {
            queries_per_second: Math.floor(Math.random() * 50) + 20,
            avg_query_time_ms: Math.floor(Math.random() * 100) + 25,
            slow_queries: Math.floor(Math.random() * 5),
            cache_hit_ratio: 0.89
        }
    };
    
    res.json({
        success: true,
        data: dbInfo,
        timestamp: new Date().toISOString()
    });
});

// POST /api/system/backup
router.post('/backup', authenticateToken, (req, res) => {
    const { backup_type = 'full', include_logs = true } = req.body;
    
    // Simulate backup process
    setTimeout(() => {
        const backupInfo = {
            backup_id: `backup_${Date.now()}`,
            type: backup_type,
            status: 'completed',
            started_at: new Date(Date.now() - 30000).toISOString(),
            completed_at: new Date().toISOString(),
            duration_ms: 30000,
            size_mb: backup_type === 'full' ? 2348 : 456,
            file_path: `/backups/rndmadmin_${backup_type}_${new Date().toISOString().split('T')[0]}.sql`,
            includes: {
                user_data: true,
                system_settings: true,
                logs: include_logs
            }
        };
        
        // Add to system logs
        systemLogs.push({
            id: systemLogs.length + 1,
            timestamp: new Date().toISOString(),
            level: 'info',
            category: 'backup',
            message: `${backup_type} backup completed successfully`,
            details: backupInfo
        });
        
        res.json({
            success: true,
            data: backupInfo,
            message: 'Backup completed successfully',
            timestamp: new Date().toISOString()
        });
    }, 2000);
});

// GET /api/system/backups
router.get('/backups', authenticateToken, (req, res) => {
    const backups = [
        {
            id: 1,
            type: 'full',
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            size_mb: 2348,
            status: 'completed',
            file_path: '/backups/rndmadmin_full_2024-12-05.sql'
        },
        {
            id: 2,
            type: 'incremental',
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            size_mb: 156,
            status: 'completed',
            file_path: '/backups/rndmadmin_incremental_2024-12-06.sql'
        },
        {
            id: 3,
            type: 'full',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            size_mb: 2201,
            status: 'completed',
            file_path: '/backups/rndmadmin_full_2024-11-29.sql'
        }
    ];
    
    res.json({
        success: true,
        data: backups,
        total: backups.length,
        timestamp: new Date().toISOString()
    });
});

// GET /api/system/settings
router.get('/settings', authenticateToken, (req, res) => {
    const settings = {
        general: {
            site_name: 'RNDM Admin',
            site_url: 'https://admin.rndm.com',
            timezone: 'UTC',
            date_format: 'YYYY-MM-DD',
            time_format: '24h'
        },
        security: {
            session_timeout: 24,
            password_policy: {
                min_length: 8,
                require_uppercase: true,
                require_lowercase: true,
                require_numbers: true,
                require_symbols: false
            },
            two_factor_auth: false,
            login_attempts_limit: 5
        },
        notifications: {
            email_notifications: true,
            system_alerts: true,
            backup_notifications: true,
            user_registration_alerts: true
        },
        maintenance: {
            maintenance_mode: false,
            backup_schedule: 'daily',
            log_retention_days: 30,
            cleanup_schedule: 'weekly'
        }
    };
    
    res.json({
        success: true,
        data: settings,
        timestamp: new Date().toISOString()
    });
});

// PUT /api/system/settings
router.put('/settings', authenticateToken, (req, res) => {
    const { category, settings } = req.body;
    
    if (!category || !settings) {
        return res.status(400).json({
            error: 'Validation error',
            message: 'Category and settings are required'
        });
    }
    
    // Log the settings change
    systemLogs.push({
        id: systemLogs.length + 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        category: 'system',
        message: `System settings updated: ${category}`,
        details: { category, changes: settings, userId: req.user.id }
    });
    
    res.json({
        success: true,
        message: `${category} settings updated successfully`,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;