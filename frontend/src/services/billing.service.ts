import apiClient from './api';
import type { Order } from './orders.service';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia' | 'otro';
export type PaymentStatus = 'completed' | 'refunded';
export type BillingStatus = 'paid' | 'pending';

export interface Payment {
  id: string;
  orderId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingOrder extends Order {
  paidAmount: string;
  outstanding: string;
  billingStatus: BillingStatus;
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

export const getBillingOrders = async (): Promise<BillingOrder[]> => {
  const response = await apiClient.get('/billing/orders');
  return response.data.data;
};

export const getPayments = async (): Promise<Payment[]> => {
  const response = await apiClient.get('/billing/payments');
  return response.data.data;
};

export const getBillingSummary = async (): Promise<BillingSummary> => {
  const response = await apiClient.get('/billing/summary');
  return response.data.data;
};

export const createPayment = async (data: {
  orderId: string;
  amount: number;
  method: PaymentMethod;
}): Promise<Payment> => {
  const response = await apiClient.post('/billing/payments', data);
  return response.data.data;
};

export const updatePaymentStatus = async (
  id: string,
  status: PaymentStatus,
): Promise<Payment> => {
  const response = await apiClient.patch(`/billing/payments/${id}`, { status });
  return response.data.data;
};