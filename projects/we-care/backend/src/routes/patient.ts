import { Request, Response, Router } from "express";
import {
  bookAppointment,
  getReferralByToken,
} from "../services/patient.service";

const router = Router();

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

router.get("/:token", async (req: Request, res: Response) => {
  const token = getParamValue(req.params.token);

  if (!token) {
    res.status(400).json({ error: "token is required" });
    return;
  }

  const referral = await getReferralByToken(token);
  res.status(200).json(referral);
});

router.post("/:token/appointments", async (req: Request, res: Response) => {
  const token = getParamValue(req.params.token);
  const { preferred_date, time_slot, notes } = req.body;

  if (!token) {
    res.status(400).json({ error: "token is required" });
    return;
  }

  if (!preferred_date || !time_slot) {
    res
      .status(400)
      .json({ error: "preferred_date and time_slot are required" });
    return;
  }

  const appointment = await bookAppointment(token, {
    preferred_date,
    time_slot,
    notes,
  });
  res.status(201).json(appointment);
});

export default router;
