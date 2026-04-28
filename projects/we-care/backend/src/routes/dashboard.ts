import { Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getDashboardSummary } from "../services/dashboard.service";
import { normalizeReferralViewType } from "../services/referral-view";
import { AuthRequest } from "../types";

const router = Router();

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const rawType = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
  const type = normalizeReferralViewType(
    typeof rawType === "string" ? rawType : undefined,
  );
  const summary = await getDashboardSummary(req.doctor!.id, type);
  res.status(200).json(summary);
});

export default router;
