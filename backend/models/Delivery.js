import mongoose from 'mongoose';

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    trackingCode: { type: String, required: true, unique: true, index: true },
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    courierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Courier', required: true, index: true },
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
    timeline: [timelineEventSchema],
  },
  { timestamps: true }
);

// Compound index for fast admin table filtering & sorting
deliverySchema.index({ isArchived: 1, status: 1, createdAt: -1 });

export default mongoose.model('Delivery', deliverySchema);