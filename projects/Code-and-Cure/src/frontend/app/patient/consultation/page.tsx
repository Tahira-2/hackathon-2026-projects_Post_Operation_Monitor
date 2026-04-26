"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function PatientConsultationPage() {
  return (
    <ProtectedRoute role="patient">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-4xl mb-3">🎥</p>
          <p className="font-medium">Video consultation</p>
          <p className="text-sm mt-1">Join your doctor when the session starts.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
