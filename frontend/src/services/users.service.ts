import apiClient from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/users/me');
  return response.data.data;
};

export const listUsers = async (): Promise<UserProfile[]> => {
  const response = await apiClient.get('/users');
  return response.data.data;
};
