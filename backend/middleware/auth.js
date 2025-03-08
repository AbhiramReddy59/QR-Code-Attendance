const jwt = require('jsonwebtoken');
const db = require('../config/database');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get full user data from database
        const [users] = await db.execute(
            'SELECT id, name, email, is_admin FROM users WHERE id = ?',
            [decoded.id]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = {
            id: users[0].id,
            name: users[0].name,
            email: users[0].email,
            isAdmin: users[0].is_admin
        };

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
