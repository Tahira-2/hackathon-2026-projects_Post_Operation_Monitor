import { Request, Response, Router } from "express";
import { authMiddleware } from "../../../middleware/auth";
import {
  forgotPassword,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "../../../services/auth.service";
import { AuthRequest } from "../../../types";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, full_name } = req.body;

  if (!email || !password || !full_name) {
    res
      .status(400)
      .json({ error: "email, password and full_name are required" });
    return;
  }

  const data = await signUp(email, password, full_name);
  res
    .status(201)
    .json({ message: "Doctor registered successfully", user: data.user });
});

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const data = await signIn(email, password);
  res.status(200).json({
    access_token: data.session?.access_token,
    doctor: data.user,
  });
});

router.post(
  "/signout",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1]!;
    await signOut(token);
    res.status(200).json({ message: "Signed out successfully" });
  },
);

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  await forgotPassword(email);
  res.status(200).json({ message: "Password reset email sent" });
});

router.post(
  "/reset-password",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { new_password } = req.body;

    if (!new_password) {
      res.status(400).json({ error: "new_password is required" });
      return;
    }

    await resetPassword(req.doctor!.id, new_password);
    res.status(200).json({ message: "Password reset successfully" });
  },
);

export default router;
