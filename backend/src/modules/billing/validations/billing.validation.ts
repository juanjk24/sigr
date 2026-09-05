import { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { fail } from '../../../shared/utils/response';
import { createPaymentSchema, updatePaymentSchema } from '../dtos/billing.dto';

const withValidation = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? 'Datos inválidos';
      return fail(res, message, 400);
    }
    req.body = result.data;
    next();
  };
};

export const validateCreatePayment = withValidation(createPaymentSchema);
export const validateUpdatePayment = withValidation(updatePaymentSchema);