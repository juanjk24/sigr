import { Request, Response, NextFunction } from 'express';
import { registerSchema } from '../dtos/register.dto';
import { loginSchema } from '../dtos/login.dto';
import { fail } from '../../../shared/utils/response';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    return fail(res, result.error.issues[0]?.message ?? 'Datos inválidos', 400);
  }
  req.body = result.data;
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return fail(res, result.error.issues[0]?.message ?? 'Datos inválidos', 400);
  }
  req.body = result.data;
  next();
};
