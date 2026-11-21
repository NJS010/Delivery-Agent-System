import Delivery from '../models/Delivery.js';
import Courier from '../models/Courier.js';
import { AppError } from '../utils/AppError.js';

const generateTrackingCode = () => `DLV-${Math.floor(100000 + Math.random() * 900000)}`;

const resolveCourier = async (source, destination, courierId, autoAssign) => {
  if (!autoAssign) {
    const courier = await Courier.findById(courierId);
    if (!courier || !courier.isActive) throw new AppError('Selected courier is unavailable.', 400);
    return courier;
  }

  const activeCouriers = await Courier.find({ isActive: true }).sort({ basePrice: 1 });
  if (!activeCouriers.length) throw new AppError('No active couriers available.', 400);

  const src = source.toLowerCase();
  const dest = destination.toLowerCase();
  return (
    activeCouriers.find((c) => {
      const locs = c.availableLocalities.map((l) => l.toLowerCase());
      return locs.includes(src) || locs.includes(dest);
    }) || activeCouriers[0]
  );
};

export const createBooking = async ({ source, destination, courierId, autoAssign = true }) => {
  if (!source?.trim() || !destination?.trim()) {
    throw new AppError('Source and destination cities are required.', 400);
  }

  const courier = await resolveCourier(source.trim(), destination.trim(), courierId, autoAssign);
  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const delivery = await Delivery.create({
    trackingCode: generateTrackingCode(),
    source: source.trim(),
    destination: destination.trim(),
    courierId: courier._id,
    cost: courier.basePrice,
    estimatedDelivery,
    timeline: [{ status: 'Booked', note: `Assigned to ${courier.name} (${source.trim()} → ${destination.trim()})` }],
  });

  return delivery.populate('courierId', 'name basePrice');
};

export const listDeliveries = async ({ archived = 'false', status = 'ALL', search = '', page = 1, limit = 8 }) => {
  const filter = { isArchived: archived === 'true' };
  if (status && status !== 'ALL') filter.status = status;
  if (search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ trackingCode: regex }, { source: regex }, { destination: regex }];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Delivery.find(filter).populate('courierId', 'name basePrice').sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Delivery.countDocuments(filter),
  ]);

  return { items, pagination: { total, page: pageNum, totalPages: Math.ceil(total / limitNum) || 1 } };
};

export const getStats = async () => {
  const [stats] = await Delivery.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        activeOrders: { $sum: {$cond: [{ $in: ['$status', ['Booked', 'In Transit', 'Rescheduled']] }, 1, 0] } },
        deliveredOrders: { $sum: {$cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] } },
        onTimeOrders: { $sum: {$cond: [{ $gt: ['$rewardPenalty', 0] }, 1, 0] } },
        totalRevenue: { $sum: { $cond: [{$ne: ['$status', 'Cancelled'] }, '$cost', 0] } },
        netRewards: { $sum: '$rewardPenalty' },
      },
    },
  ]);

  const data = stats || { totalOrders: 0, activeOrders: 0, deliveredOrders: 0, onTimeOrders: 0, totalRevenue: 0, netRewards: 0 };
  return { ...data, slaRate: data.deliveredOrders ? Math.round((data.onTimeOrders / data.deliveredOrders) * 100) : 100 };
};

export const trackByCode = async (rawCode) => {
  const query = rawCode.trim();
  const delivery = await Delivery.findOne({
    $or: [{ trackingCode: query.toUpperCase() }, ...(query.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: query }] : [])],
  }).populate('courierId', 'name basePrice');

  if (!delivery) throw new AppError('Tracking record not found.', 404);
  return delivery;
};

export const rescheduleOrder = async (id, { newDestination, newDate }) => {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (['Delivered', 'Cancelled'].includes(delivery.status)) {
    throw new AppError(`Cannot reschedule a ${delivery.status.toLowerCase()} order.`, 400);
  }

  const changes = [];
  if (newDestination?.trim()) { delivery.destination = newDestination.trim(); changes.push(`destination → ${delivery.destination}`); }
  if (newDate) { delivery.estimatedDelivery = new Date(newDate); changes.push(`ETA → ${delivery.estimatedDelivery.toLocaleDateString('en-IN')}`); }

  delivery.status = 'Rescheduled';
  delivery.timeline.push({ status: 'Rescheduled', note: changes.length ? `Updated ${changes.join(', ')}` : 'Delivery rescheduled' });
  await delivery.save();
  return delivery.populate('courierId', 'name basePrice');
};

export const cancelOrder = async (id) => {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (delivery.status === 'Delivered') throw new AppError('Delivered orders cannot be cancelled.', 400);

  delivery.status = 'Cancelled';
  delivery.timeline.push({ status: 'Cancelled', note: 'Booking cancelled by customer' });
  return delivery.save();
};

export const completeOrder = async (id, onTime) => {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (delivery.status === 'Cancelled') throw new AppError('Cannot complete a cancelled delivery.', 400);

  const amount = onTime ? 50 : -20;
  delivery.status = 'Delivered';
  delivery.rewardPenalty = amount;
  delivery.deliveredAt = new Date();
  delivery.timeline.push({ status: 'Delivered', note: onTime ? 'Delivered on time (Reward +₹50)' : 'Delivered late (Penalty -₹20)' });
  await delivery.save();
  return { delivery, amount };
};

export const archiveOrder = async (id) => {
  const delivery = await Delivery.findById(id);
  if (!delivery) throw new AppError('Delivery not found.', 404);
  if (!['Delivered', 'Cancelled'].includes(delivery.status)) {
    throw new AppError('Only delivered or cancelled orders can be archived.', 400);
  }

  delivery.isArchived = true;
  delivery.timeline.push({ status: 'Archived', note: 'Moved to cold archive by operations' });
  return delivery.save();
};

export const getCourierReport = async (courierId) => {
  const courier = await Courier.findById(courierId);
  if (!courier) throw new AppError('Courier not found.', 404);

  const records = await Delivery.find({ courierId: courier._id }).sort({ createdAt: -1 });
  return {
    courier: courier.name,
    totalAssigned: records.length,
    completedCount: records.filter((r) => r.status === 'Delivered').length,
    netRewards: records.reduce((sum, r) => sum + (r.rewardPenalty || 0), 0),
    records,
  };
};