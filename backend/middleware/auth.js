import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.admin = verified;
        next(); // Token is valid, proceed to the actual route
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};