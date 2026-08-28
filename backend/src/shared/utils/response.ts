import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

export const success = <T>(res: Response, data: T, status = 200, message?: string) => {
  const body: ApiResponse<T> = { success: true, data, message };
  return res.status(status).json(body);
};

export const fail = (res: Response, error: string, status = 400) => {
  const body: ApiResponse = { success: false, error };
  return res.status(status).json(body);
};

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}
