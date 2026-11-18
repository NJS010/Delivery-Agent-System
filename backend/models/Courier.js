import mongoose from 'mongoose';

const courierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    availableLocalities: [{ type: String }],
    basePrice: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
});

export default mongoose.model('Courier',courierSchema);