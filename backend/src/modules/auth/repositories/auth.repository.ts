import { eq } from 'drizzle-orm';
import { db } from '../../../config/db';
import { users, roles, User, NewUser } from '../../../db/schema';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
};

export const findRoleByName = async (name: string) => {
  const rows = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  return rows[0] ?? null;
};

export const findRoleById = async (id: string) => {
  const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return rows[0] ?? null;
};

export const createUser = async (data: NewUser): Promise<User> => {
  const rows = await db.insert(users).values(data).returning();
  return rows[0];
};

export const ensureRole = async (name: string) => {
  const existing = await findRoleByName(name);
  if (existing) {
    return existing;
  }
  await db.insert(roles).values({ name }).onConflictDoNothing();
  const created = await findRoleByName(name);
  if (!created) {
    throw new Error(`No se pudo crear el rol ${name}`);
  }
  return created;
};
