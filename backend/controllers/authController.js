const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email);

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if user exists
        const [users] = await db.execute(
            'SELECT e.*, r.name as role_name FROM employees e JOIN roles r ON e.role_id = r.id WHERE e.email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                role: user.role_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token in cookie and also return it in the response
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Send response
        return res.json({
            success: true,
            message: 'Login successful',
            token: token, // Include token in response for localStorage
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role_name,
                department: user.department,
                position: user.position
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login'
        });
    }
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    try {
        // Try to get token from cookie first, then from Authorization header
        let token = req.cookies.token;
        
        // If not in cookie, check Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        console.log('Verifying token:', token ? 'present' : 'missing');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token verified for user:', decoded.email);

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired, please login again'
            });
        }
        res.status(401).json({
            success: false,
            message: 'Invalid authentication'
        });
    }
};

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Logout controller
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logout successful'
    });
};

module.exports = {
    login,
    logout,
    verifyToken,
    isAdmin
};
