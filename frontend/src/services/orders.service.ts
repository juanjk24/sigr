import apiClient from './api';

interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

export const getOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get('/orders');
  return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: any): Promise<Order> => {
  const response = await apiClient.post('/orders', data);
  return response.data;
};

export const updateOrder = async (id: string, data: any): Promise<Order> => {
  const response = await apiClient.put(`/orders/${id}`, data);
  return response.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await apiClient.delete(`/orders/${id}`);
};
