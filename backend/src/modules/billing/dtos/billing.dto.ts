import { z } from 'zod';

export const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'transferencia', 'otro'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ['completed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const createPaymentSchema = z.object({
  orderId: z.string().uuid('Pedido inválido'),
  amount: z.coerce
    .number()
    .positive('El monto debe ser mayor a 0'),
  method: z.enum(PAYMENT_METHODS, { message: 'Método de pago inválido' }),
});

export const updatePaymentSchema = z.object({
  status: z.enum(PAYMENT_STATUSES, { message: 'Estado de pago inválido' }),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentDto = z.infer<typeof updatePaymentSchema>;