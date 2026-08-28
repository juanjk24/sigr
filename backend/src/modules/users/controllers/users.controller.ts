import { Request, Response } from 'express';
import { getProfile, listUsers } from '../services/users.service';
import { success, fail } from '../../../shared/utils/response';

export const profileHandler = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return fail(res, 'No autorizado', 401);
    }
    const profile = await getProfile(req.user.id);
    return success(res, profile, 200);
  } catch (err) {
    if (err instanceof Error && (err as any).status) {
      return fail(res, err.message, (err as any).status);
    }
    return fail(res, 'Error al obtener el perfil', 500);
  }
};

export const listHandler = async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();
    return success(res, users, 200);
  } catch {
    return fail(res, 'Error al listar usuarios', 500);
  }
};
