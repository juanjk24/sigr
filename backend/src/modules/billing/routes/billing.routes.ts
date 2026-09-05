import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/auth.middleware';
import {
  validateCreatePayment,
  validateUpdatePayment,
} from '../validations/billing.validation';
import {
  listBillingOrdersHandler,
  listPaymentsHandler,
  getBillingSummaryHandler,
  createPaymentHandler,
  updatePaymentHandler,
} from '../controllers/billing.controller';

const router = Router();

router.use(authenticate);

router.get('/orders', listBillingOrdersHandler);
router.get('/payments', listPaymentsHandler);
router.get('/summary', getBillingSummaryHandler);
router.post('/payments', validateCreatePayment, createPaymentHandler);
router.patch('/payments/:id', validateUpdatePayment, updatePaymentHandler);

export default router;