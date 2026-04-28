import { Response, Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../middleware/auth";
import {
  getDoctorProfileById,
  getDoctorProfile,
  getDoctorProfileLookups,
  updateDoctorProfile,
  uploadAvatar,
} from "../../../services/doctors.service";
import { AuthRequest } from "../../../types";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

router.get(
  "/lookups",
  authMiddleware,
  async (_req: AuthRequest, res: Response) => {
    const lookups = await getDoctorProfileLookups();
    res.status(200).json(lookups);
  },
);

router.get(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const profile = await getDoctorProfile(req.doctor!.id);
    res.status(200).json(profile);
  },
);

router.get(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const doctorId = getParamValue(req.params.id);
    if (!doctorId) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    const profile = await getDoctorProfileById(doctorId);
    res.status(200).json(profile);
  },
);

router.patch(
  "/profile",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const {
      full_name,
      email,
      contact_number,
      specialty,
      license_number,
      hospital,
    } = req.body;

    const hasAtLeastOneField =
      full_name !== undefined ||
      email !== undefined ||
      contact_number !== undefined ||
      specialty !== undefined ||
      license_number !== undefined ||
      hospital !== undefined;

    if (!hasAtLeastOneField) {
      res.status(400).json({ error: "At least one profile field is required" });
      return;
    }

    const updates = {
      full_name,
      email,
      contact_number,
      specialty,
      license_number,
      hospital,
    };

    const updated = await updateDoctorProfile(req.doctor!.id, updates);
    res.status(200).json(updated);
  },
);

router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: "Avatar file is required" });
      return;
    }

    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const result = await uploadAvatar(
      req.doctor!.id,
      req.file.buffer,
      req.file.mimetype,
      accessToken,
    );
    res.status(200).json(result);
  },
);

export default router;
