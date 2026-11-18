import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
    source: { type: String, required: true },
    destination: { type: String, required: true },
    // Link to the Courier collection instead of a raw string
    courierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courier', required: true },
    status: { type: String, enum: ['Booked', 'In Transit', 'Delivered', 'Cancelled'], default: 'Booked' },
    cost: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    isArchived: { type: Boolean, default: false },
    rewardPenalty: { type: Number, default: 0} 
});

export default mongoose.model('Delivery', deliverySchema);