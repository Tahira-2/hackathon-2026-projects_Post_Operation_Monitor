import { Routes, Route, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Landing } from "@/pages/Landing";
import { AboutUs } from "@/pages/public/AboutUs";
import { Services } from "@/pages/public/Services";
import { Contact } from "@/pages/public/Contact";
import { Login } from "@/pages/auth/Login";

export function PublicRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Landing />} />

      <Route element={<PublicLayout />}>
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
