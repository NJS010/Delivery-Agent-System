import express from 'express';
import Courier from '../models/Courier.js';
import { verifyToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCourierSchema } from '../validators/schemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post(
  '/add',
  verifyToken,
  validate(createCourierSchema),
  asyncHandler(async (req, res) => {
    const saved = await Courier.create(req.body);
    res.status(201).json(saved);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const couriers = await Courier.find({ isActive: true }).sort({ basePrice: 1 });
    res.json(couriers);
  })
);

export default router;