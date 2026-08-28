import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  email: z.string().email('Email inválido').max(254),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(72),
});

export type RegisterDto = z.infer<typeof registerSchema>;
