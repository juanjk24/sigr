import apiClient from './api';

interface Reservation {
  id: string;
  userId: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  createdAt: string;
}

export const getReservations = async (): Promise<Reservation[]> => {
  const response = await apiClient.get('/reservations');
  return response.data;
};

export const getReservationById = async (id: string): Promise<Reservation> => {
  const response = await apiClient.get(`/reservations/${id}`);
  return response.data;
};

export const createReservation = async (data: any): Promise<Reservation> => {
  const response = await apiClient.post('/reservations', data);
  return response.data;
};

export const updateReservation = async (id: string, data: any): Promise<Reservation> => {
  const response = await apiClient.put(`/reservations/${id}`, data);
  return response.data;
};

export const deleteReservation = async (id: string): Promise<void> => {
  await apiClient.delete(`/reservations/${id}`);
};
