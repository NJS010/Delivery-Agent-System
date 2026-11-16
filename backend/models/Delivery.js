import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
    source: { type: String, required: true },
    destination: { type: String, required: true },
    courierName: { type: String, required: true },
    status: { type: String, enum: ['Booked', 'In Transit', 'Delivered', 'Cancelled'], default: 'Booked' },
    cost: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now }
});

export default mongoose.model('Delivery', deliverySchema);