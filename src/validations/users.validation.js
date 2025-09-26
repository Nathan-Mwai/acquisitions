import { z } from 'zod';

// Schema to validate user ID in route parameters
export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'User ID must be a valid number')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0, 'User ID must be a positive number'),
});

// Schema to validate user update requests
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name cannot be empty')
      .max(255, 'Name cannot exceed 255 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email cannot exceed 255 characters')
      .toLowerCase()
      .trim()
      .optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password cannot exceed 128 characters')
      .optional(),
    role: z
      .enum(['user', 'admin'], {
        errorMap: () => ({ message: 'Role must be either "user" or "admin"' }),
      })
      .optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
