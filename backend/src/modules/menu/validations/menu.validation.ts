import { Request, Response, NextFunction } from 'express';
import {
  createCategorySchema,
  updateCategorySchema,
  createDishSchema,
  updateDishSchema,
} from '../dtos/menu.dto';
import { fail } from '../../../shared/utils/response';

const handle = (res: Response, result: { success: boolean; data?: unknown }) => {
  if (!result.success) {
    return fail(res, 'Datos inválidos', 400);
  }
  return result.data;
};

export const validateCreateCategory = (req: Request, res: Response, next: NextFunction) => {
  const result = createCategorySchema.safeParse(req.body);
  const parsed = handle(res, result);
  if (!result.success) return parsed;
  req.body = result.data;
  next();
};

export const validateUpdateCategory = (req: Request, res: Response, next: NextFunction) => {
  const result = updateCategorySchema.safeParse(req.body);
  const parsed = handle(res, result);
  if (!result.success) return parsed;
  req.body = result.data;
  next();
};

export const validateCreateDish = (req: Request, res: Response, next: NextFunction) => {
  const result = createDishSchema.safeParse(req.body);
  const parsed = handle(res, result);
  if (!result.success) return parsed;
  req.body = result.data;
  next();
};

export const validateUpdateDish = (req: Request, res: Response, next: NextFunction) => {
  const result = updateDishSchema.safeParse(req.body);
  const parsed = handle(res, result);
  if (!result.success) return parsed;
  req.body = result.data;
  next();
};
