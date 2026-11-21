import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  bookDelivery,
  getAllDeliveries,
  getDeliveryStatus,
  rescheduleDelivery,
  cancelDelivery,
  completeDelivery,
  archiveDelivery,
  getCourierAnalytics,
  getDashboardStats
} from '../controllers/deliveryController.js';

const router = express.Router();

// Public / Customer routes
router.post('/book', bookDelivery);
router.get('/track/:code', getDeliveryStatus);
router.put('/:id/reschedule', rescheduleDelivery);
router.put('/:id/cancel', cancelDelivery);

// Protected / Admin routes
router.get('/stats', verifyToken, getDashboardStats);
router.get('/', verifyToken, getAllDeliveries);
router.put('/:id/complete', verifyToken, completeDelivery);
router.put('/:id/archive', verifyToken, archiveDelivery);
router.get('/courier/:courierId/analytics', verifyToken, getCourierAnalytics);

export default router;

