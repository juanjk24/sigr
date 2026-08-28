import { Request, Response } from 'express';
import * as menuService from '../services/menu.service';
import { success, fail } from '../../../shared/utils/response';

const catchErr = (res: Response, err: unknown, fallback: string) => {
  if (err instanceof Error && (err as any).status) {
    return fail(res, err.message, (err as any).status);
  }
  return fail(res, fallback, 500);
};

// Categories
export const listCategoriesHandler = async (_req: Request, res: Response) => {
  try {
    const data = await menuService.listCategories();
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al listar categorías');
  }
};

export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const data = await menuService.createCategory(req.body);
    return success(res, data, 201, 'Categoría creada');
  } catch (err) {
    return catchErr(res, err, 'Error al crear categoría');
  }
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const data = await menuService.updateCategory(req.params.id, req.body);
    return success(res, data, 200, 'Categoría actualizada');
  } catch (err) {
    return catchErr(res, err, 'Error al actualizar categoría');
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    await menuService.deleteCategory(req.params.id);
    return success(res, null, 200, 'Categoría eliminada');
  } catch (err) {
    return catchErr(res, err, 'Error al eliminar categoría');
  }
};

// Dishes
export const listDishesHandler = async (_req: Request, res: Response) => {
  try {
    const data = await menuService.listDishes();
    return success(res, data, 200);
  } catch (err) {
    return catchErr(res, err, 'Error al listar platos');
  }
};

export const createDishHandler = async (req: Request, res: Response) => {
  try {
    const data = await menuService.createDish(req.body);
    return success(res, data, 201, 'Plato creado');
  } catch (err) {
    return catchErr(res, err, 'Error al crear plato');
  }
};

export const updateDishHandler = async (req: Request, res: Response) => {
  try {
    const data = await menuService.updateDish(req.params.id, req.body);
    return success(res, data, 200, 'Plato actualizado');
  } catch (err) {
    return catchErr(res, err, 'Error al actualizar plato');
  }
};

export const deleteDishHandler = async (req: Request, res: Response) => {
  try {
    await menuService.deleteDish(req.params.id);
    return success(res, null, 200, 'Plato eliminado');
  } catch (err) {
    return catchErr(res, err, 'Error al eliminar plato');
  }
};
