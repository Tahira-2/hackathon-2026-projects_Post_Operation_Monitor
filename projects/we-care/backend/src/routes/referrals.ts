import { Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createPatientAndReferral,
  getReferralById,
  getReferralsByDoctor,
  updateAppointmentStatus,
  updateReferralStatus,
} from "../services/referrals.service";
import { normalizeReferralViewType } from "../services/referral-view";
import { AuthRequest } from "../types";

const router = Router();
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInteger(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(getParamValue(value));

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { patient, referral } = req.body;

  if (
    !patient?.full_name ||
    !patient?.email ||
    !referral?.doctor_id ||
    !referral?.clinical_notes
  ) {
    res
      .status(400)
      .json({
        error:
          "patient.full_name, patient.email, referral.doctor_id and referral.clinical_notes are required",
      });
    return;
  }

  const result = await createPatientAndReferral(
    req.doctor!.id,
    patient,
    referral,
  );
  res.status(201).json(result);
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const page = parsePositiveInteger(
    req.query.page as string | string[] | undefined,
    DEFAULT_PAGE,
  );
  const pageSize = Math.min(
    parsePositiveInteger(
      req.query.pageSize as string | string[] | undefined,
      DEFAULT_PAGE_SIZE,
    ),
    MAX_PAGE_SIZE,
  );
  const type = normalizeReferralViewType(
    getParamValue(req.query.type as string | string[] | undefined),
  );

  const referrals = await getReferralsByDoctor(req.doctor!.id, {
    page,
    pageSize,
    type,
  });
  res.status(200).json(referrals);
});

router.get("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
  const referralId = getParamValue(req.params.id);

  if (!referralId) {
    res.status(400).json({ error: "id is required" });
    return;
  }

  const referral = await getReferralById(referralId, req.doctor!.id);
  res.status(200).json(referral);
});

router.patch(
  "/:id/appointment",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const referralId = getParamValue(req.params.id);
    const allowed = ["confirmed", "cancelled"];

    if (!referralId) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    if (!status || !allowed.includes(status)) {
      res
        .status(400)
        .json({ error: `status must be one of: ${allowed.join(", ")}` });
      return;
    }

    const updated = await updateAppointmentStatus(
      referralId,
      req.doctor!.id,
      status as "confirmed" | "cancelled",
    );
    res.status(200).json(updated);
  },
);

router.patch(
  "/:id/status",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const referralId = getParamValue(req.params.id);
    const allowed = ["pending", "sent", "accepted", "completed"];

    if (!referralId) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    if (!status || !allowed.includes(status)) {
      res
        .status(400)
        .json({ error: `status must be one of: ${allowed.join(", ")}` });
      return;
    }

    const updated = await updateReferralStatus(
      referralId,
      req.doctor!.id,
      status,
    );
    res.status(200).json(updated);
  },
);

export default router;
