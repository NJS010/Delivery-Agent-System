import express from 'express';
import Delivery from '../models/Delivery.js';

const router = express.Router();

// Book a delivery
router.post('/book', async (req, res) => {
    try{
        const newDelivery = new Delivery(req.body);
        const saved = await newDelivery.save();
        res.status(201).json({ message: 'Booking confirmed', data: saved });
    } catch(err){
        res.status(400).json({ error: err.message });
    }
});

// Check status of a delivery
router.put('/:id/cancel', async (req, res) => {
    try{
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            { status : 'Cancelled' },
            { new: true }
        );
        res.json({ message: 'Cancellation confirmed', data: delivery });
    } catch(err){
        res.status(400).json({ error : err.message });
    }
});

// Cancel a booking
router.put('/:id/cancel', async (req,res) => {
    try{
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            { status: 'Cancelled' },
            { new: true }
        );
        res.json({ message: 'Cancellation confirmed', data: delivery });
    } catch (err){
        res.status(400).json({ error: err.message });
    }
});

export default router;

