import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    trackingCode: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    courierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courier', required: true },
    status: {
      type: String,
      enum: ['Booked', 'In Transit', 'Delivered', 'Cancelled', 'Rescheduled'],
      default: 'Booked',
    },
    cost: { type: Number, required: true, min: 1 },
    estimatedDelivery: { type: Date, required: true },
    deliveredAt: { type: Date },
    isArchived: { type: Boolean, default: false },
    rewardPenalty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Delivery', deliverySchema);