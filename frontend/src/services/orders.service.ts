import apiClient from './api';

export type OrderType = 'domicilio' | 'para_llevar' | 'para_aqui';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
}

export interface Order {
  id: string;
  userId: string;
  type: OrderType;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  tableNumber: string | null;
  notes: string | null;
  total: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: { id: string; name: string } | null;
}

export interface CreateOrderPayload {
  type: OrderType;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  tableNumber?: string;
  notes?: string;
  items: Array<{ dishId: string; quantity: number }>;
}

export const getOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get('/orders');
  return response.data.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data.data;
};

export const createOrder = async (data: CreateOrderPayload): Promise<Order> => {
  const response = await apiClient.post('/orders', data);
  return response.data.data;
};

export const updateOrder = async (id: string, data: Partial<CreateOrderPayload>): Promise<Order> => {
  const response = await apiClient.put(`/orders/${id}`, data);
  return response.data.data;
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });
  return response.data.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/orders/${id}`);
};