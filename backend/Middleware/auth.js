const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: verified.userId, role: verified.role };
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
}

function adminOnly(req, res, next) {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access Forbidden' });
    next();
}

module.exports = { auth, adminOnly };
