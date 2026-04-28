/**
 * VideoConsultationDemo
 * ─────────────────────
 * Public demo route for previewing the consultation UI without auth.
 * Access at: /demo/consultation
 *
 * REMOVE this file before production deployment.
 */
import { VideoConsultationPage } from "@/pages/shared/VideoConsultation";

export function VideoConsultationDemo() {
  return <VideoConsultationPage />;
}
