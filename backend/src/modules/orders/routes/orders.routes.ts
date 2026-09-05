import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateOrderStatus,
} from '../validations/orders.validation';
import {
  listOrdersHandler,
  getOrderByIdHandler,
  createOrderHandler,
  updateOrderHandler,
  updateOrderStatusHandler,
  deleteOrderHandler,
} from '../controllers/orders.controller';

const router = Router();

router.use(authenticate);

router.get('/', listOrdersHandler);
router.post('/', validateCreateOrder, createOrderHandler);

router.get('/:id', getOrderByIdHandler);
router.put('/:id', validateUpdateOrder, updateOrderHandler);
router.patch('/:id/status', validateUpdateOrderStatus, updateOrderStatusHandler);
router.delete('/:id', deleteOrderHandler);

export default router;