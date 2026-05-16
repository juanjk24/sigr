import apiClient from './api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
};
