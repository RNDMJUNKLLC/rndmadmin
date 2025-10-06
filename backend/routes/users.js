const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');

// Mock users database
let users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@rndm.com',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-12-06T10:30:00Z',
        profile: {
            first_name: 'Admin',
            last_name: 'User',
            avatar: null,
            phone: '+1-555-0123'
        }
    },
    {
        id: 2,
        username: 'john_doe',
        email: 'john.doe@example.com',
        role: 'user',
        status: 'active',
        created_at: '2024-11-15T14:20:00Z',
        last_login: '2024-12-05T16:45:00Z',
        profile: {
            first_name: 'John',
            last_name: 'Doe',
            avatar: null,
            phone: '+1-555-0124'
        }
    },
    {
        id: 3,
        username: 'jane_smith',
        email: 'jane.smith@example.com',
        role: 'moderator',
        status: 'active',
        created_at: '2024-10-20T09:15:00Z',
        last_login: '2024-12-04T12:30:00Z',
        profile: {
            first_name: 'Jane',
            last_name: 'Smith',
            avatar: null,
            phone: '+1-555-0125'
        }
    },
    {
        id: 4,
        username: 'mike_wilson',
        email: 'mike.wilson@example.com',
        role: 'user',
        status: 'inactive',
        created_at: '2024-09-10T11:00:00Z',
        last_login: '2024-11-20T08:15:00Z',
        profile: {
            first_name: 'Mike',
            last_name: 'Wilson',
            avatar: null,
            phone: '+1-555-0126'
        }
    }
];

// GET /api/users - Get all users with pagination and filtering
router.get('/', authenticateToken, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || '';
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 'desc';
        
        let filteredUsers = [...users];
        
        // Apply search filter
        if (search) {
            filteredUsers = filteredUsers.filter(user =>
                user.username.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.profile.first_name.toLowerCase().includes(search.toLowerCase()) ||
                user.profile.last_name.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply role filter
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }
        
        // Apply status filter
        if (status) {
            filteredUsers = filteredUsers.filter(user => user.status === status);
        }
        
        // Apply sorting
        filteredUsers.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy.includes('.')) {
                const keys = sortBy.split('.');
                aValue = keys.reduce((obj, key) => obj[key], a);
                bValue = keys.reduce((obj, key) => obj[key], b);
            }
            
            if (sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
        });
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        // Remove sensitive data
        const safeUsers = paginatedUsers.map(user => ({
            ...user,
            password: undefined // Never send password
        }));
        
        res.json({
            success: true,
            data: safeUsers,
            pagination: {
                current_page: page,
                per_page: limit,
                total_items: filteredUsers.length,
                total_pages: Math.ceil(filteredUsers.length / limit)
            },
            filters: {
                search,
                role,
                status,
                sortBy,
                sortOrder
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to retrieve users'
        });
    }
});

// GET /api/users/:id - Get specific user
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const user = users.find(u => u.id === userId);
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            });
        }
        
        // Remove sensitive data
        const safeUser = {
            ...user,
            password: undefined
        };
        
        res.json({
            success: true,
            data: safeUser,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to retrieve user'
        });
    }
});

// POST /api/users - Create new user
router.post('/', authenticateToken, (req, res) => {
    try {
        const { username, email, role, first_name, last_name, phone } = req.body;
        
        // Validation
        if (!username || !email) {
            return res.status(400).json({
                error: 'Validation error',
                message: 'Username and email are required'
            });
        }
        
        // Check if user already exists
        const existingUser = users.find(u => 
            u.username === username || u.email === email
        );
        
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'Username or email is already taken'
            });
        }
        
        // Create new user
        const newUser = {
            id: Math.max(...users.map(u => u.id)) + 1,
            username,
            email,
            role: role || 'user',
            status: 'active',
            created_at: new Date().toISOString(),
            last_login: null,
            profile: {
                first_name: first_name || '',
                last_name: last_name || '',
                avatar: null,
                phone: phone || ''
            }
        };
        
        users.push(newUser);
        
        // Remove sensitive data from response
        const safeUser = {
            ...newUser,
            password: undefined
        };
        
        res.status(201).json({
            success: true,
            data: safeUser,
            message: 'User created successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to create user'
        });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            });
        }
        
        const { username, email, role, status, first_name, last_name, phone } = req.body;
        
        // Check if new username/email conflicts with existing users
        if (username || email) {
            const conflictUser = users.find(u => 
                u.id !== userId && (u.username === username || u.email === email)
            );
            
            if (conflictUser) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Username or email is already taken by another user'
                });
            }
        }
        
        // Update user
        const updatedUser = {
            ...users[userIndex],
            ...(username && { username }),
            ...(email && { email }),
            ...(role && { role }),
            ...(status && { status }),
            profile: {
                ...users[userIndex].profile,
                ...(first_name && { first_name }),
                ...(last_name && { last_name }),
                ...(phone && { phone })
            },
            updated_at: new Date().toISOString()
        };
        
        users[userIndex] = updatedUser;
        
        // Remove sensitive data
        const safeUser = {
            ...updatedUser,
            password: undefined
        };
        
        res.json({
            success: true,
            data: safeUser,
            message: 'User updated successfully',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to update user'
        });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            });
        }
        
        // Prevent deleting the admin user (ID 1)
        if (userId === 1) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Cannot delete the admin user'
            });
        }
        
        // Remove user
        const deletedUser = users.splice(userIndex, 1)[0];
        
        res.json({
            success: true,
            message: `User ${deletedUser.username} deleted successfully`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to delete user'
        });
    }
});

// GET /api/users/stats - Get user statistics
router.get('/stats/overview', authenticateToken, (req, res) => {
    try {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const stats = {
            total_users: users.length,
            active_users: users.filter(u => u.status === 'active').length,
            inactive_users: users.filter(u => u.status === 'inactive').length,
            new_users_24h: users.filter(u => new Date(u.created_at) > last24h).length,
            new_users_week: users.filter(u => new Date(u.created_at) > lastWeek).length,
            new_users_month: users.filter(u => new Date(u.created_at) > lastMonth).length,
            users_by_role: {
                admin: users.filter(u => u.role === 'admin').length,
                moderator: users.filter(u => u.role === 'moderator').length,
                user: users.filter(u => u.role === 'user').length
            },
            recent_logins_24h: users.filter(u => 
                u.last_login && new Date(u.last_login) > last24h
            ).length
        };
        
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to retrieve user statistics'
        });
    }
});

// POST /api/users/:id/toggle-status - Toggle user active/inactive status
router.post('/:id/toggle-status', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({
                error: 'User not found',
                message: `User with ID ${userId} does not exist`
            });
        }
        
        // Prevent toggling admin user status
        if (userId === 1) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Cannot change admin user status'
            });
        }
        
        // Toggle status
        const currentStatus = users[userIndex].status;
        users[userIndex].status = currentStatus === 'active' ? 'inactive' : 'active';
        users[userIndex].updated_at = new Date().toISOString();
        
        res.json({
            success: true,
            data: {
                id: userId,
                status: users[userIndex].status
            },
            message: `User status changed to ${users[userIndex].status}`,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to toggle user status'
        });
    }
});

module.exports = router;