import { z } from 'zod';

export const bookDeliverySchema = z.object({
  source: z.string().trim().min(2, 'Source city is too short').max(60),
  destination: z.string().trim().min(2, 'Destination city is too short').max(60),
  autoAssign: z.boolean().default(true),
  courierId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid courierId').optional(),
});

export const rescheduleSchema = z.object({
  newDestination: z.string().trim().min(2).max(60).optional().or(z.literal('')),
  newDate: z.string().optional().or(z.literal('')),
});

export const completeDeliverySchema = z.object({
  onTime: z.boolean(),
});

export const createCourierSchema = z.object({
  name: z.string().trim().min(2).max(60),
  availableLocalities: z.array(z.string().trim().min(2)).min(1, 'At least one locality required'),
  basePrice: z.coerce.number().positive('Base price must be greater than 0'),
});

export const authSchema = z.object({
  username: z.string().trim().min(3).max(40),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});