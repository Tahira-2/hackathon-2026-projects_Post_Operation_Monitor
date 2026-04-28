import { createHashRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import DoctorProfilePage from "../pages/DoctorProfilePage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import NewReferralPage from "../pages/NewReferralPage";
import PatientBookingConfirmationPage from "../pages/PatientBookingConfirmationPage";
import PatientBookingPage from "../pages/PatientBookingPage";
import PatientBookingReviewPage from "../pages/PatientBookingReviewPage";
import PatientPortalPage from "../pages/PatientPortalPage";
import { NotFoundPage } from "../pages/placeholders";
import ReferralDetailPage from "../pages/ReferralDetailPage";
import ReferralsPage from "../pages/ReferralsPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SettingsPage from "../pages/SettingsPage";
import SignupPage from "../pages/SignupPage";
import SpecialistsPage from "../pages/SpecialistsPage";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export const router = createHashRouter([
  // Auth — redirect to / if already logged in
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },

  // Doctor portal — requires auth, renders inside AppLayout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/referrals", element: <ReferralsPage /> },
          { path: "/referrals/new", element: <NewReferralPage /> },
          { path: "/referrals/:id", element: <ReferralDetailPage /> },
          { path: "/doctors/:id", element: <DoctorProfilePage /> },
          { path: "/specialists", element: <SpecialistsPage /> },
          { path: "/profile", element: <SettingsPage /> },
          { path: "/settings", element: <SettingsPage /> },
        ],
      },
    ],
  },

  // Patient portal — token-gated, no auth
  { path: "/p/:token", element: <PatientPortalPage /> },
  { path: "/p/:token/book", element: <PatientBookingPage /> },
  { path: "/p/:token/review", element: <PatientBookingReviewPage /> },
  { path: "/p/:token/confirmed", element: <PatientBookingConfirmationPage /> },
  { path: "/patient/:token", element: <PatientPortalPage /> },
  { path: "/patient/:token/book", element: <PatientBookingPage /> },
  { path: "/patient/:token/review", element: <PatientBookingReviewPage /> },
  {
    path: "/patient/:token/confirmed",
    element: <PatientBookingConfirmationPage />,
  },

  // Fallback
  { path: "*", element: <NotFoundPage /> },
]);
