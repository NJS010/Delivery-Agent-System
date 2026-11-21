import { asyncHandler } from '../utils/asyncHandler.js';
import * as deliveryService from '../services/deliveryService.js';

export const bookDelivery = asyncHandler(async (req, res) => {
  const data = await deliveryService.createBooking(req.body);
  res.status(201).json({ message: 'Booking confirmed', data });
});

export const getAllDeliveries = asyncHandler(async (req, res) => {
  res.json(await deliveryService.listDeliveries(req.query));
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  res.json(await deliveryService.getStats());
});

export const getDeliveryStatus = asyncHandler(async (req, res) => {
  res.json(await deliveryService.trackByCode(req.params.code));
});

export const rescheduleDelivery = asyncHandler(async (req, res) => {
  const data = await deliveryService.rescheduleOrder(req.params.id, req.body);
  res.json({ message: 'Delivery rescheduled', data });
});

export const cancelDelivery = asyncHandler(async (req, res) => {
  const data = await deliveryService.cancelOrder(req.params.id);
  res.json({ message: 'Booking cancelled', data });
});

export const completeDelivery = asyncHandler(async (req, res) => {
  const { delivery, amount } = await deliveryService.completeOrder(req.params.id, req.body.onTime);
  const label = amount > 0 ? `Reward +₹${amount}` : `Penalty -₹${Math.abs(amount)}`;
  res.json({ message: `Marked delivered. ${label} applied.`, data: delivery });
});

export const archiveDelivery = asyncHandler(async (req, res) => {
  const data = await deliveryService.archiveOrder(req.params.id);
  res.json({ message: 'Record archived', data });
});

export const getCourierAnalytics = asyncHandler(async (req, res) => {
  res.json(await deliveryService.getCourierReport(req.params.courierId));
});