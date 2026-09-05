import { Request, Response } from 'express';
import * as ordersService from '../services/orders.service';
import { success, fail } from '../../../shared/utils/response';

const catchErr = (res: Response, err: unknown, fallback: string) => {
  if (err instanceof Error && (err as any).status) {
    return fail(res, err.message, (err as any).status);
  }
  return fail(res, fallback, 500);
};

export const listOrdersHandler = async (_req: Request, res: Response) => {
  try {
    const data = await ordersService.listOrders();
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al listar pedidos');
  }
};

export const getOrderByIdHandler = async (req: Request, res: Response) => {
  try {
    const data = await ordersService.getOrderById(req.params.id);
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al obtener el pedido');
  }
};

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const data = await ordersService.createOrder(req.user!.id, req.body);
    return success(res, data, 201, 'Pedido creado');
  } catch (err) {
    return catchErr(res, err, 'Error al crear el pedido');
  }
};

export const updateOrderHandler = async (req: Request, res: Response) => {
  try {
    const data = await ordersService.updateOrder(req.params.id, req.body);
    return success(res, data, 200, 'Pedido actualizado');
  } catch (err) {
    return catchErr(res, err, 'Error al actualizar el pedido');
  }
};

export const updateOrderStatusHandler = async (req: Request, res: Response) => {
  try {
    const data = await ordersService.updateOrderStatus(req.params.id, req.body.status);
    return success(res, data, 200, 'Estado del pedido actualizado');
  } catch (err) {
    return catchErr(res, err, 'Error al actualizar el estado del pedido');
  }
};

export const deleteOrderHandler = async (req: Request, res: Response) => {
  try {
    await ordersService.deleteOrder(req.params.id);
    return success(res, null, 200, 'Pedido eliminado');
  } catch (err) {
    return catchErr(res, err, 'Error al eliminar el pedido');
  }
};