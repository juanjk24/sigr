import apiClient from './api';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Dish {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  image: string | null;
  active: boolean;
  category?: Category;
  createdAt: string;
}

export const listCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/menu/categories');
  return response.data.data;
};

export const createCategory = async (
  data: { name: string; description?: string },
): Promise<Category> => {
  const response = await apiClient.post('/menu/categories', data);
  return response.data.data;
};

export const updateCategory = async (
  id: string,
  data: { name?: string; description?: string },
): Promise<Category> => {
  const response = await apiClient.put(`/menu/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/menu/categories/${id}`);
};

export const listDishes = async (): Promise<Dish[]> => {
  const response = await apiClient.get('/menu/dishes');
  return response.data.data;
};

export const createDish = async (data: {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
}): Promise<Dish> => {
  const response = await apiClient.post('/menu/dishes', data);
  return response.data.data;
};

export const updateDish = async (
  id: string,
  data: Partial<{
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    active: boolean;
  }>,
): Promise<Dish> => {
  const response = await apiClient.put(`/menu/dishes/${id}`, data);
  return response.data.data;
};

export const deleteDish = async (id: string): Promise<void> => {
  await apiClient.delete(`/menu/dishes/${id}`);
};
