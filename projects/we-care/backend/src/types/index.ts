import { Request } from 'express';

export interface AuthRequest extends Request {
  doctor?: {
    id: string;
    email: string;
    full_name: string;
  };
}
