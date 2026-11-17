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

// Reschedule a delivery
router.put('/:id/reschedule', async (req, res) => {
    try{
        const { newDestination, newDate } = req.body;
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            {
                status : 'Rescheduled',
                destination : newDestination || undefined,
                deliveryDate: newDate ? new Date(newDate) : undefined
            },
            { new : true }
        );
        res.json({ message: 'Delivery rescheduled successfully',data: delivery });
    } catch(err){
        res.status(400).json({ error: err.message });
    }
});

// Calculate reward/penalty and mark as delivered
router.put('/:id/complete', async (req, res) => {
    try{
        const { onTime } = req.body;
        const amount = onTime ? 50 : -20;

        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Delivered',
                rewardPenalty: amount,
                deliveryDate: Date.now()
            },
            { new: true }
        );
        res.json({ message: `Delivery completed. Courier assigned a ${amount > 0 ? 'reward' : 'penalty'} of ₹${Math.abs(amount)}.`, data: delivery });
    } catch (err){
        res.status(400).json({ error: err.message });
    }
});

// Archive a record
router.put('/:id/archive', async (req, res) => {
    try {
        const delivery = await Delivery.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new : true }
        );
        res.json({ message: 'Record archived successfully ', data: delivery });
    } catch(err){
        res.status(400).json({ error: err.message });
    }
});

// Get past services for a courier (Archived/Completed)
router.get('/courier/:courierName/history', async (req, res) => {
    try{
        const history = await Delivery.find({
            courierName: req.params.courierName,
            isArchived: true
        });

        const totalRewards = history.reduce((sum, record) => sum + record.rewardPenalty, 0);

        res.json({
            courier: req.params.courierName,
            totalDeliveries: history.length,
            netRewards: totalRewards,
            records: history
        });
    } catch(err){
        res.status(400).json({ error: err.message });
    }
});

export default router;

