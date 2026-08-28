import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { HttpError } from '../../../shared/utils/response';
import {
  createUser,
  findUserByEmail,
  ensureRole,
  findRoleById,
} from '../repositories/auth.repository';
import { AuthResponse, AuthUser } from '../entities/user.entity';
import { RegisterDto } from '../dtos/register.dto';

const DEFAULT_ROLE = 'cliente';

export const register = async (data: RegisterDto): Promise<AuthResponse> => {
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new HttpError('El email ya está registrado', 409);
  }

  const role = await ensureRole(DEFAULT_ROLE);

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await createUser({
    name: data.name,
    email: data.email,
    passwordHash,
    roleId: role.id,
  });

  return buildAuthResponse(user.id, user.name, user.email, role.name);
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError('Credenciales inválidas', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError('Credenciales inválidas', 401);
  }

  const role = await findRoleById(user.roleId);
  return buildAuthResponse(user.id, user.name, user.email, role?.name ?? DEFAULT_ROLE);
};

const buildAuthResponse = (
  id: string,
  name: string,
  email: string,
  role: string,
): AuthResponse => {
  const user: AuthUser = { id, name, email, role };
  const token = jwt.sign({ id, email, role }, env.jwtSecret, {
    expiresIn: '7d',
  });
  return { token, user };
};
