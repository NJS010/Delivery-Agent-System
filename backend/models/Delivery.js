import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
    source: { type: String, required: true},
    destination: { type: String, required: true},
    courierName: { type: String, required: true},
    status: { type: String, enum: ['Booked', 'In Transit', 'Delivered', 'Cancelled', 'Rescheduled']},
    cost: { type: Number, required: true},
    bookingDate: { type: Date, default: Date.now},
    deliveryDate: { type: Date },
    isArchived: { type: Boolean, default: false },
    rewardPenalty: {type: Number, default: 0}
});

export default mongoose.model('Delivery',deliverySchema);