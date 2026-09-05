import { eq, desc, and, ne } from 'drizzle-orm';
import { db } from '../../../config/db';
import { orders, payments, users } from '../../../db/schema';
import type { Order, Payment } from '../../../db/schema';
import { HttpError } from '../../../shared/utils/response';
import { loadOrderItems, OrderItemEnriched } from '../../orders/services/orders.service';
import { CreatePaymentDto, PaymentStatus } from '../dtos/billing.dto';

const toMoney = (n: number): string => String(n.toFixed(2));

interface PaymentEnriched extends Payment {
  order: {
    id: string;
    type: string;
    customerName: string | null;
    tableNumber: string | null;
    total: string;
  } | null;
}

export interface BillingOrder extends Order {
  user: { id: string; name: string } | null;
  items: OrderItemEnriched[];
  paidAmount: string;
  outstanding: string;
  billingStatus: 'paid' | 'pending';
  payments: Payment[];
}

export interface BillingSummary {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalSales: string;
  totalPaid: string;
  totalPending: string;
}

const getOrderBilling = async (order: Order): Promise<BillingOrder> => {
  const [paymentRows, userRows, items] = await Promise.all([
    db.select().from(payments).where(eq(payments.orderId, order.id)),
    db.select().from(users).where(eq(users.id, order.userId)).limit(1),
    loadOrderItems(order.id),
  ]);
  const paid = paymentRows
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const total = parseFloat(order.total);
  const outstanding = Math.max(0, total - paid);
  return {
    ...order,
    user: userRows[0]
      ? { id: userRows[0].id, name: userRows[0].name }
      : null,
    items,
    paidAmount: toMoney(paid),
    outstanding: toMoney(outstanding),
    billingStatus: outstanding <= 0.001 ? 'paid' : 'pending',
    payments: paymentRows,
  };
};

export const listBillingOrders = async (): Promise<BillingOrder[]> => {
  const rows = await db
    .select()
    .from(orders)
    .where(ne(orders.status, 'cancelled'))
    .orderBy(desc(orders.createdAt));
  return Promise.all(rows.map(getOrderBilling));
};

export const listPayments = async (): Promise<PaymentEnriched[]> => {
  const rows = await db.select().from(payments).orderBy(desc(payments.createdAt));
  return Promise.all(
    rows.map(async (payment) => {
      const orderRows = await db
        .select()
        .from(orders)
        .where(eq(orders.id, payment.orderId))
        .limit(1);
      const order = orderRows[0];
      return {
        ...payment,
        order: order
          ? {
              id: order.id,
              type: order.type,
              customerName: order.customerName,
              tableNumber: order.tableNumber,
              total: order.total,
            }
          : null,
      };
    }),
  );
};

export const getBillingSummary = async (): Promise<BillingSummary> => {
  const billingOrders = await listBillingOrders();
  const totalSales = billingOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
  const totalPaid = billingOrders.reduce((sum, o) => sum + parseFloat(o.paidAmount), 0);
  const totalPending = billingOrders.reduce((sum, o) => sum + parseFloat(o.outstanding), 0);
  return {
    totalOrders: billingOrders.length,
    paidOrders: billingOrders.filter((o) => o.billingStatus === 'paid').length,
    pendingOrders: billingOrders.filter((o) => o.billingStatus === 'pending').length,
    totalSales: toMoney(totalSales),
    totalPaid: toMoney(totalPaid),
    totalPending: toMoney(totalPending),
  };
};

const getPayableInfo = async (orderId: string) => {
  const orderRows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!orderRows[0]) {
    throw new HttpError('Pedido no encontrado', 404);
  }
  const order = orderRows[0];
  if (order.status === 'cancelled') {
    throw new HttpError('No se puede cobrar un pedido cancelado', 400);
  }
  const paidRows = await db
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'completed')));
  const paid = paidRows.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const total = parseFloat(order.total);
  return { order, total, outstanding: Math.max(0, total - paid) };
};

export const createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
  const info = await getPayableInfo(data.orderId);
  if (data.amount > info.outstanding + 0.001) {
    throw new HttpError('El monto supera el saldo pendiente del pedido', 400);
  }
  const rows = await db
    .insert(payments)
    .values({
      orderId: data.orderId,
      amount: toMoney(data.amount),
      method: data.method,
      status: 'completed',
      paidAt: new Date(),
    })
    .returning();
  return rows[0];
};

export const updatePaymentStatus = async (
  id: string,
  status: PaymentStatus,
): Promise<Payment> => {
  const rows = await db
    .update(payments)
    .set({ status, updatedAt: new Date() })
    .where(eq(payments.id, id))
    .returning();
  if (!rows[0]) {
    throw new HttpError('Pago no encontrado', 404);
  }
  return rows[0];
};