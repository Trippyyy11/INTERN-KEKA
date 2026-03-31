import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // Fallback for tools/testing
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password -slackBotToken').populate('reportingManager', 'name email');

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please login again.' });
        }
        res.status(500).json({ message: 'Internal Server Error during authentication' });
    }
};

export const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role ${req.user.role} is not authorized for this route` });
        }
        next();
    };
};

export const hasPermission = (permission) => {
    return (req, res, next) => {
        const isSuperAdmin = req.user?.role?.toLowerCase().replace(/\s/g, '') === 'superadmin';
        if (isSuperAdmin || req.user?.permissions?.[permission]) {
            return next();
        }
        return res.status(403).json({ message: `You do not have the required permission: ${permission}` });
    };
};

