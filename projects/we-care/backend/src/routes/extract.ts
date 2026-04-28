import { Router, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { extractReferralFromNotes } from '../services/extract.service';
import { AuthRequest } from '../types';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { notes } = req.body;

  if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
    res.status(400).json({ error: 'Clinical notes are required' });
    return;
  }

  const extracted = await extractReferralFromNotes(notes);
  res.status(200).json(extracted);
});

export default router;
