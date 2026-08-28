import { eq } from 'drizzle-orm';
import { db } from '../../../config/db';
import { users, roles, User } from '../../../db/schema';
import { HttpError } from '../../../shared/utils/response';

const withRole = async (user: User) => {
  const roleRows = await db
    .select({ name: roles.name })
    .from(roles)
    .where(eq(roles.id, user.roleId))
    .limit(1);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleRows[0]?.name ?? null,
    createdAt: user.createdAt,
  };
};

export const getProfile = async (id: string) => {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const user = rows[0];
  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }
  return withRole(user);
};

export const listUsers = async () => {
  const allUsers = await db.select().from(users);
  return Promise.all(allUsers.map(withRole));
};
