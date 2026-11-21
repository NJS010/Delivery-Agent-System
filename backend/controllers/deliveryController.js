import Delivery from '../models/Delivery.js';
import Courier from '../models/Courier.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const generateTrackingCode = () => `DLV-${Math.floor(100000 + Math.random() * 900000)}`;

export const bookDelivery = asyncHandler(async (req, res) => {
  const { source, destination, courierId, autoAssign = true } = req.body;

  if (!source?.trim() || !destination?.trim()) {
    throw new AppError('Source and destination cities are required.', 400);
  }

  let chosenCourier = null;

  if (autoAssign) {
    const srcLower = source.trim().toLowerCase();
    const destLower = destination.trim().toLowerCase();
    const activeCouriers = await Courier.find({ isActive: true }).sort({ basePrice: 1 });

    if (!activeCouriers.length) {
      throw new AppError('No active couriers available in the system.', 400);
    }

    chosenCourier =
      activeCouriers.find((c) => {
        const locs = c.availableLocalities.map((l) => l.toLowerCase());
        return locs.includes(srcLower) || locs.includes(destLower);
      }) || activeCouriers[0];
  } else {
    chosenCourier = await Courier.findById(courierId);
    if (!chosenCourier || !chosenCourier.isActive) {
      throw new AppError('Selected courier is unavailable.', 400);
    }
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

  const delivery = await Delivery.create({
    trackingCode: generateTrackingCode(),
    source: source.trim(),
    destination: destination.trim(),
    courierId: chosenCourier._id,
    cost: chosenCourier.basePrice,
    estimatedDelivery,
    timeline: [
      {
        status: 'Booked',
        note: `Assigned to ${chosenCourier.name} (${source.trim()} → ${destination.trim()})`,
      },
    ],
  });

  const populated = await delivery.populate('courierId', 'name basePrice');
  res.status(201).json({ message: 'Booking confirmed', data: populated });
});

export const getAllDeliveries = asyncHandler(async (req, res) => {
  const { archived = 'false', status = 'ALL', search = '', page = 1, limit = 8 } = req.query;

  const filter = { isArchived: archived === 'true' };
  if (status && status !== 'ALL') filter.status = status;

  if (search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ trackingCode: regex }, { source: regex }, { destination: regex }];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Delivery.find(filter)
      .populate('courierId', 'name basePrice')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Delivery.countDocuments(filter),
  ]);

  res.json({
    items,
    pagination: {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [stats] = await Delivery.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        activeOrders: {
          $sum: { $cond: [{ $in: ['$status', ['Booked', 'In Transit', 'Rescheduled']] }, 1, 0] },
        },
        deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
        onTimeOrders: { $sum: { $cond: [{ $gt: ['$rewardPenalty', 0] }, 1, 0] } },
        totalRevenue: {
          $sum: { $cond: [{ $ne: ['$status', 'Cancelled'] }, '$cost', 0] },
        },
        netRewards: { $sum: '$rewardPenalty' },
      },
    },
  ]);

  const data = stats || {
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    onTimeOrders: 0,
    totalRevenue: 0,
    netRewards: 0,
  };

  const slaRate = data.deliveredOrders
    ? Math.round((data.onTimeOrders / data.deliveredOrders) * 100)
    : 100;

  res.json({ ...data, slaRate });
});

export const getDeliveryStatus = asyncHandler(async (req, res) => {
  const query = req.params.code.trim();
  const delivery = await Delivery.findOne({
    $or: [
      { trackingCode: query.toUpperCase() },
      ...(query.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: query }] : []),
    ],
  }).populate('courierId', 'name basePrice');

  if (!delivery) throw new AppError('Tracking record not found.', 404);
  res.json(delivery);
});

export const rescheduleDelivery = asyncHandler(async (req, res) => {
  const { newDestination, newDate } = req.body;
  const delivery = await Delivery.findById(req.params.id);

  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (['Delivered', 'Cancelled'].includes(delivery.status)) {
    throw new AppError(`Cannot reschedule a ${delivery.status.toLowerCase()} order.`, 400);
  }

  const changes = [];
  if (newDestination?.trim()) {
    delivery.destination = newDestination.trim();
    changes.push(`destination → ${delivery.destination}`);
  }
  if (newDate) {
    delivery.estimatedDelivery = new Date(newDate);
    changes.push(`ETA → ${delivery.estimatedDelivery.toLocaleDateString('en-IN')}`);
  }

  delivery.status = 'Rescheduled';
  delivery.timeline.push({
    status: 'Rescheduled',
    note: changes.length ? `Updated ${changes.join(', ')}` : 'Delivery rescheduled',
  });

  await delivery.save();
  const populated = await delivery.populate('courierId', 'name basePrice');
  res.json({ message: 'Delivery rescheduled', data: populated });
});

export const cancelDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (delivery.status === 'Delivered') {
    throw new AppError('Delivered orders cannot be cancelled.', 400);
  }

  delivery.status = 'Cancelled';
  delivery.timeline.push({ status: 'Cancelled', note: 'Booking cancelled by customer' });
  await delivery.save();

  res.json({ message: 'Booking cancelled', data: delivery });
});

export const completeDelivery = asyncHandler(async (req, res) => {
  const { onTime } = req.body;
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (delivery.status === 'Cancelled') {
    throw new AppError('Cannot complete a cancelled delivery.', 400);
  }

  const amount = onTime ? 50 : -20;
  delivery.status = 'Delivered';
  delivery.rewardPenalty = amount;
  delivery.deliveredAt = new Date();
  delivery.timeline.push({
    status: 'Delivered',
    note: onTime ? 'Delivered on time (Reward +₹50)' : 'Delivered late (Penalty -₹20)',
  });

  await delivery.save();
  res.json({
    message: `Marked delivered. ${amount > 0 ? `Reward +₹${amount}` : `Penalty -₹${Math.abs(amount)}`} applied.`,
    data: delivery,
  });
});

export const archiveDelivery = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (!['Delivered', 'Cancelled'].includes(delivery.status)) {
    throw new AppError('Only delivered or cancelled orders can be archived.', 400);
  }

  delivery.isArchived = true;
  delivery.timeline.push({ status: 'Archived', note: 'Moved to cold archive by operations' });
  await delivery.save();

  res.json({ message: 'Record archived', data: delivery });
});

export const getCourierAnalytics = asyncHandler(async (req, res) => {
  const courier = await Courier.findById(req.params.courierId);
  if (!courier) throw new AppError('Courier not found.', 404);

  const records = await Delivery.find({ courierId: courier._id }).sort({ createdAt: -1 });
  const delivered = records.filter((r) => r.status === 'Delivered');
  const netRewards = records.reduce((sum, r) => sum + (r.rewardPenalty || 0), 0);

  res.json({
    courier: courier.name,
    totalAssigned: records.length,
    completedCount: delivered.length,
    netRewards,
    records,
  });
});