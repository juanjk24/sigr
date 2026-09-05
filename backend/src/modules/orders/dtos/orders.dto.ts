import { z } from 'zod';

export const ORDER_TYPES = ['domicilio', 'para_llevar', 'para_aqui'] as const;
export type OrderType = (typeof ORDER_TYPES)[number];

export const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderItemSchema = z.object({
  dishId: z.string().uuid('Plato inválido'),
  quantity: z
    .coerce
    .number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1'),
});

const orderBaseSchema = z.object({
  type: z.enum(ORDER_TYPES, { message: 'Tipo de pedido inválido' }),
  customerName: z.string().min(1, 'El nombre es requerido').max(120).optional(),
  customerPhone: z.string().min(1, 'El teléfono es requerido').max(30).optional(),
  customerAddress: z.string().min(1, 'La dirección es requerida').max(1000).optional(),
  tableNumber: z.string().min(1, 'El número de mesa es requerido').max(20).optional(),
  notes: z.string().max(2000).optional(),
  items: z.array(orderItemSchema).min(1, 'Debe incluir al menos un producto'),
  status: z.enum(ORDER_STATUSES).optional(),
});

export const createOrderSchema = orderBaseSchema.superRefine((data, ctx) => {
    if (data.type === 'domicilio') {
      if (!data.customerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customerName'],
          message: 'El nombre es requerido para domicilio',
        });
      }
      if (!data.customerPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customerPhone'],
          message: 'El teléfono es requerido para domicilio',
        });
      }
      if (!data.customerAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customerAddress'],
          message: 'La dirección es requerida para domicilio',
        });
      }
    }
    if (data.type === 'para_llevar') {
      if (!data.customerName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customerName'],
          message: 'El nombre es requerido para llevar',
        });
      }
      if (!data.customerPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customerPhone'],
          message: 'El teléfono es requerido para llevar',
        });
      }
    }
    if (data.type === 'para_aqui') {
      if (!data.tableNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tableNumber'],
          message: 'El número de mesa es requerido',
        });
      }
    }
  });

export const updateOrderSchema = orderBaseSchema.partial();

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, { message: 'Estado inválido' }),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;