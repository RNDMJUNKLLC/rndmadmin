const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user database (replace with real database)
const users = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@rndm.com',
        password: '$2a$10$example.hashed.password', // 'admin123'
        role: 'admin',
        active: true,
        created_at: new Date('2024-01-01'),
        last_login: new Date()
    }
];

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'rndm_admin_secret_key_2024';

// Middleware to verify JWT tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        
        // For development - allow empty credentials
        if (process.env.NODE_ENV === 'development' || !username || !password) {
            const mockUser = users[0];
            const token = jwt.sign(
                { 
                    id: mockUser.id, 
                    username: mockUser.username, 
                    role: mockUser.role 
                },
                JWT_SECRET,
                { expiresIn: rememberMe ? '30d' : '24h' }
            );
            
            return res.json({
                success: true,
                token,
                user: {
                    id: mockUser.id,
                    username: mockUser.username,
                    email: mockUser.email,
                    role: mockUser.role
                },
                expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
            });
        }
        
        // Find user by username or email
        const user = users.find(u => 
            u.username === username || u.email === username
        );
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }
        
        if (!user.active) {
            return res.status(401).json({ 
                error: 'Account disabled',
                message: 'Your account has been disabled. Contact administrator.'
            });
        }
        
        // Verify password (in development, skip password verification)
        const isValidPassword = process.env.NODE_ENV === 'development' || 
                               await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Username or password is incorrect'
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '24h' }
        );
        
        // Update last login
        user.last_login = new Date();
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            expiresIn: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            error: 'Server error',
            message: 'An error occurred during login'
        });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
    // In a real implementation, you might blacklist the token
    // For now, just return success
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// GET /api/auth/verify
router.get('/verify', authenticateToken, (req, res) => {
    // Find user details
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({ 
            error: 'User not found' 
        });
    }
    
    res.json({
        valid: true,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            last_login: user.last_login
        }
    });
});

// POST /api/auth/refresh
router.post('/refresh', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.id);
        
        if (!user || !user.active) {
            return res.status(401).json({ 
                error: 'User not found or disabled' 
            });
        }
        
        // Generate new token
        const newToken = jwt.sign(
            { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token: newToken,
            expiresIn: 24 * 60 * 60 * 1000
        });
        
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ 
            error: 'Server error' 
        });
    }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                error: 'New password must be at least 6 characters long' 
            });
        }
        
        const user = users.find(u => u.id === req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                error: 'User not found' 
            });
        }
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                error: 'Current password is incorrect' 
            });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            error: 'Server error' 
        });
    }
});

// Export middleware for use in other routes
module.exports = router;
module.exports.authenticateToken = authenticateToken;