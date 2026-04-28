import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getAvailableSpecialists } from '../services/specialists.service';

const router = Router();
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const specialty = req.query.specialty as string | undefined;
  const page = parsePositiveInteger(req.query.page, DEFAULT_PAGE);
  const pageSize = Math.min(
    parsePositiveInteger(req.query.pageSize, DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );

  const specialists = await getAvailableSpecialists({
    specialty,
    page,
    pageSize,
  });
  res.status(200).json(specialists);
});

export default router;
