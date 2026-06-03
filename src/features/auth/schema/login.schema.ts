import { z } from 'zod';

export const loginSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code required'),
  password: z.string().min(1, 'Password required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code required'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
