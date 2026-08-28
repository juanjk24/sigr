import { Request, Response } from 'express';
import { register, login } from '../services/auth.service';
import { success, fail } from '../../../shared/utils/response';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const result = await register(req.body);
    return success(res, result, 201, 'Usuario registrado correctamente');
  } catch (err) {
    if (err instanceof Error && (err as any).status) {
      return fail(res, err.message, (err as any).status);
    }
    return fail(res, 'Error al registrar usuario', 500);
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    return success(res, result, 200, 'Inicio de sesión exitoso');
  } catch (err) {
    if (err instanceof Error && (err as any).status) {
      return fail(res, err.message, (err as any).status);
    }
    return fail(res, 'Error al iniciar sesión', 500);
  }
};
