import { Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { AuthRequest } from '../types';

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  const { data: doctor, error: doctorError } = await supabase
    .from('doctors')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single();

  if (doctorError || !doctor) {
    res.status(403).json({ error: 'Doctor profile not found' });
    return;
  }

  req.doctor = doctor;
  next();
}
