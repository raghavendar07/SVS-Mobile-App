import { z } from 'zod';

export const loginSchema = z.object({
  employeeCode: z.string().min(1, 'Please enter your employee code.'),
  password: z.string().min(1, 'Please enter your password.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  employeeCode: z.string().min(1, 'Please enter your employee code.'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
