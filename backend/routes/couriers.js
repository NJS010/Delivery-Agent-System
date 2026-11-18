import express from 'express';
import Courier from '../models/Courier.js'

const router = express.Router();

// Add a new courier to the system
router.post('/add',async (req, res) => {
    try{
        const newCourier = new Courier(req.body);
        const saved = await newCourier.save();
        res.status(201).json(saved);
    } catch(err){
        res.status(400).json({ error: err.message });
    }
});

// Get all active couriers for the frontend dropdown
router.get('/', async (req, res) => {
    try{
        const couriers = await Courier.find({ isActive : true });
        res.json(couriers);
    } catch(err) {
        res.status(400).json({ error : err.message });
    }
});

export default router;