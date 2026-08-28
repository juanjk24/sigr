import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(1000).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createDishSchema = z.object({
  categoryId: z.string().uuid('Categoría inválida'),
  name: z.string().min(1, 'El nombre es requerido').max(150),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  image: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  active: z.boolean().optional(),
});

export const updateDishSchema = createDishSchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type CreateDishDto = z.infer<typeof createDishSchema>;
export type UpdateDishDto = z.infer<typeof updateDishSchema>;
