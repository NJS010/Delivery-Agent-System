import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const router = express.Router();

// 1. Register first admin (Hit this once via Postman to create your login)
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newAdmin = new Admin({ username: req.body.username, password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. Login route to generate JWT
router.post('/login', async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        if (!admin) return res.status(400).json({ error: 'Invalid username or password' });
        
        const validPass = await bcrypt.compare(req.body.password, admin.password);
        if (!validPass) return res.status(400).json({ error: 'Invalid username or password' });

        // Generate token valid for 2 hours
        const token = jwt.sign({ _id: admin._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, message: 'Logged in successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;