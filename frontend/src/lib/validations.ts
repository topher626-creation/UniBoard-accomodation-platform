import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['student', 'landlord']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Property schemas
export const createPropertySchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  location: z.string().min(2, 'Location is required'),
  compound: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  capacity: z.number().positive('Capacity must be positive'),
  amenities: z.array(z.string()).optional(),
});

// Booking schemas
export const createBookingSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  checkInDate: z.string().datetime('Invalid date format'),
  checkOutDate: z.string().datetime('Invalid date format'),
});

// Review schemas
export const createReviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment cannot exceed 500 characters'),
});

export const createReviewWithPropertySchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must not exceed 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters'),
});

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreatePropertyFormData = z.infer<typeof createPropertySchema>;
export type CreateBookingFormData = z.infer<typeof createBookingSchema>;
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
