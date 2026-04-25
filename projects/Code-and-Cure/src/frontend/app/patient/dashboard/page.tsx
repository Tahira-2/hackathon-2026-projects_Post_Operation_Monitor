"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const [symptom, setSymptom] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    const specialty = "Cardiology"; // mock logic
    router.push(`/patient/doctors?specialty=${specialty}`);
  };

  return (
    <ProtectedRoute role="patient">
      <div className="p-6">
        <h1 className="text-xl mb-4">Patient Dashboard</h1>

        <input
          className="border p-2 w-full"
          placeholder="Enter symptoms..."
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="mt-4 bg-green-600 text-white px-4 py-2"
        >
          Find Doctor
        </button>
      </div>
    </ProtectedRoute>
  );
}