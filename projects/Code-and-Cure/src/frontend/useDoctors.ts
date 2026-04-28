"use client";

import { useEffect, useState } from "react";
import { mockApi, Doctor } from "./mock_api";

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mockApi.getDoctors().then((data) => {
      setDoctors(data);
      setLoading(false);
    });
  }, []);

  return { doctors, loading };
}