import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bookDeliverySchema, rescheduleSchema, completeDeliverySchema } from '../validators/schemas.js';
import {
  bookDelivery,
  getAllDeliveries,
  getDashboardStats,
  getDeliveryStatus,
  rescheduleDelivery,
  cancelDelivery,
  completeDelivery,
  archiveDelivery,
  getCourierAnalytics,
} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/book', validate(bookDeliverySchema), bookDelivery);
router.get('/track/:code', getDeliveryStatus);
router.put('/:id/reschedule', validate(rescheduleSchema), rescheduleDelivery);
router.put('/:id/cancel', cancelDelivery);

router.get('/stats', verifyToken, getDashboardStats);
router.get('/', verifyToken, getAllDeliveries);
router.put('/:id/complete', verifyToken, validate(completeDeliverySchema), completeDelivery);
router.put('/:id/archive', verifyToken, archiveDelivery);
router.get('/courier/:courierId/analytics', verifyToken, getCourierAnalytics);

export default router;