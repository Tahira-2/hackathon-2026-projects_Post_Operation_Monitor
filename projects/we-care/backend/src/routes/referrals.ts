import { Response, Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createPatientAndReferral,
  getReferralById,
  getReferralsByDoctor,
  updateReferralStatus,
} from "../services/referrals.service";
import { AuthRequest } from "../types";

const router = Router();

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { patient, referral } = req.body;

  if (
    !patient?.full_name ||
    !referral?.specialist_id ||
    !referral?.clinical_notes
  ) {
    res
      .status(400)
      .json({
        error:
          "patient.full_name, referral.specialist_id and referral.clinical_notes are required",
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
  const referrals = await getReferralsByDoctor(req.doctor!.id);
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
