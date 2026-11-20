import Delivery from '../models/Delivery.js';
import Courier from '../models/Courier.js';

const generateTrackingCode = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `DLV-${num}`;
};

export const bookDelivery = async (req, res) => {
  try {
    const { source, destination, courierId, autoAssign = true } = req.body;

    if (!source?.trim() || !destination?.trim()) {
      return res.status(400).json({ error: 'Source and destination cities are required.' });
    }

    let chosenCourier = null;

    if (autoAssign) {
      // Match active couriers servicing the source or destination, sorted by lowest basePrice
      const srcLower = source.trim().toLowerCase();
      const destLower = destination.trim().toLowerCase();

      const activeCouriers = await Courier.find({ isActive: true }).sort({ basePrice: 1 });
      if (!activeCouriers.length) {
        return res.status(400).json({ error: 'No active couriers available in the system.' });
      }

      chosenCourier =
        activeCouriers.find((c) => {
          const locs = c.availableLocalities.map((l) => l.toLowerCase());
          return locs.includes(srcLower) || locs.includes(destLower);
        }) || activeCouriers[0]; // fallback to cheapest active courier
    } else {
      chosenCourier = await Courier.findById(courierId);
      if (!chosenCourier || !chosenCourier.isActive) {
        return res.status(400).json({ error: 'Selected courier is unavailable.' });
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
    });

    const populated = await delivery.populate('courierId', 'name basePrice');
    res.status(201).json({ message: 'Booking confirmed', data: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllDeliveries = async (req, res) => {
  try {
    const { archived = 'false', status } = req.query;
    const filter = { isArchived: archived === 'true' };
    if (status && status !== 'ALL') filter.status = status;

    const deliveries = await Delivery.find(filter)
      .populate('courierId', 'name basePrice')
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDeliveryStatus = async (req, res) => {
  try {
    const query = req.params.code.trim();
    const delivery = await Delivery.findOne({
      $or: [{ trackingCode: query.toUpperCase() }, ...(query.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: query }] : [])],
    }).populate('courierId', 'name basePrice');

    if (!delivery) return res.status(404).json({ error: 'Tracking record not found.' });
    res.json(delivery);
  } catch (err) {
    res.status(400).json({ error: 'Invalid tracking code.' });
  }
};

export const rescheduleDelivery = async (req, res) => {
  try {
    const { newDestination, newDate } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) return res.status(404).json({ error: 'Delivery not found.' });
    if (['Delivered', 'Cancelled'].includes(delivery.status)) {
      return res.status(400).json({ error: `Cannot reschedule a ${delivery.status.toLowerCase()} order.` });
    }

    if (newDestination?.trim()) delivery.destination = newDestination.trim();
    if (newDate) delivery.estimatedDelivery = new Date(newDate);
    delivery.status = 'Rescheduled';

    await delivery.save();
    const populated = await delivery.populate('courierId', 'name basePrice');
    res.json({ message: 'Delivery rescheduled', data: populated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const cancelDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found.' });
    if (delivery.status === 'Delivered') {
      return res.status(400).json({ error: 'Delivered orders cannot be cancelled.' });
    }

    delivery.status = 'Cancelled';
    await delivery.save();
    res.json({ message: 'Booking cancelled', data: delivery });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const completeDelivery = async (req, res) => {
  try {
    const { onTime } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found.' });
    if (delivery.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot complete a cancelled delivery.' });
    }

    const amount = onTime ? 50 : -20;
    delivery.status = 'Delivered';
    delivery.rewardPenalty = amount;
    delivery.deliveredAt = new Date();
    await delivery.save();

    res.json({
      message: `Marked delivered. ${amount > 0 ? `Reward +₹${amount}` : `Penalty -₹${Math.abs(amount)}`} applied.`,
      data: delivery,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const archiveDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found.' });
    if (!['Delivered', 'Cancelled'].includes(delivery.status)) {
      return res.status(400).json({ error: 'Only delivered or cancelled orders can be archived.' });
    }

    delivery.isArchived = true;
    await delivery.save();
    res.json({ message: 'Record archived', data: delivery });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCourierAnalytics = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.courierId);
    if (!courier) return res.status(404).json({ error: 'Courier not found.' });

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
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};