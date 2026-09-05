import { Request, Response } from 'express';
import * as billingService from '../services/billing.service';
import { success, fail } from '../../../shared/utils/response';

const catchErr = (res: Response, err: unknown, fallback: string) => {
  if (err instanceof Error && (err as any).status) {
    return fail(res, err.message, (err as any).status);
  }
  return fail(res, fallback, 500);
};

export const listBillingOrdersHandler = async (_req: Request, res: Response) => {
  try {
    const data = await billingService.listBillingOrders();
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al listar estados de facturación');
  }
};

export const listPaymentsHandler = async (_req: Request, res: Response) => {
  try {
    const data = await billingService.listPayments();
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al listar pagos');
  }
};

export const getBillingSummaryHandler = async (_req: Request, res: Response) => {
  try {
    const data = await billingService.getBillingSummary();
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al calcular el resumen de facturación');
  }
};

export const createPaymentHandler = async (req: Request, res: Response) => {
  try {
    const data = await billingService.createPayment(req.body);
    return success(res, data, 201, 'Pago registrado');
  } catch (err) {
    return catchErr(res, err, 'Error al registrar el pago');
  }
};

export const updatePaymentHandler = async (req: Request, res: Response) => {
  try {
    const data = await billingService.updatePaymentStatus(req.params.id, req.body.status);
    return success(res, data, 200, 'Pago actualizado');
  } catch (err) {
    return catchErr(res, err, 'Error al actualizar el pago');
  }
};