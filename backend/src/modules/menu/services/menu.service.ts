import { eq, desc } from 'drizzle-orm';
import { db } from '../../../config/db';
import { categories, dishes, Category, Dish } from '../../../db/schema';
import { HttpError } from '../../../shared/utils/response';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateDishDto,
  UpdateDishDto,
} from '../dtos/menu.dto';

// ---------- Categories ----------
export const listCategories = async (): Promise<Category[]> => {
  return db.select().from(categories).orderBy(desc(categories.createdAt));
};

export const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
  const rows = await db.insert(categories).values(data).returning();
  return rows[0];
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryDto,
): Promise<Category> => {
  const rows = await db
    .update(categories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(categories.id, id))
    .returning();
  if (!rows[0]) {
    throw new HttpError('Categoría no encontrada', 404);
  }
  return rows[0];
};

export const deleteCategory = async (id: string): Promise<void> => {
  const rows = await db.delete(categories).where(eq(categories.id, id)).returning();
  if (!rows[0]) {
    throw new HttpError('Categoría no encontrada', 404);
  }
};

// ---------- Dishes ----------
export const listDishes = async (): Promise<(Dish & { category?: Category })[]> => {
  const rows = await db.select().from(dishes).orderBy(desc(dishes.createdAt));
  return Promise.all(
    rows.map(async (dish) => {
      const catRows = await db
        .select()
        .from(categories)
        .where(eq(categories.id, dish.categoryId))
        .limit(1);
      return { ...dish, category: catRows[0] };
    }),
  );
};

export const createDish = async (data: CreateDishDto): Promise<Dish> => {
  const catRows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, data.categoryId))
    .limit(1);
  if (!catRows[0]) {
    throw new HttpError('La categoría no existe', 400);
  }
  const { price, ...rest } = data;
  const rows = await db
    .insert(dishes)
    .values({ ...rest, price: String(price) })
    .returning();
  return rows[0];
};

export const updateDish = async (id: string, data: UpdateDishDto): Promise<Dish> => {
  if (data.categoryId) {
    const catRows = await db
      .select()
      .from(categories)
      .where(eq(categories.id, data.categoryId))
      .limit(1);
    if (!catRows[0]) {
      throw new HttpError('La categoría no existe', 400);
    }
  }
  const { price, ...rest } = data;
  const rows = await db
    .update(dishes)
    .set({
      ...rest,
      ...(price !== undefined ? { price: String(price) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(dishes.id, id))
    .returning();
  if (!rows[0]) {
    throw new HttpError('Plato no encontrado', 404);
  }
  return rows[0];
};

export const deleteDish = async (id: string): Promise<void> => {
  const rows = await db.delete(dishes).where(eq(dishes.id, id)).returning();
  if (!rows[0]) {
    throw new HttpError('Plato no encontrado', 404);
  }
};
