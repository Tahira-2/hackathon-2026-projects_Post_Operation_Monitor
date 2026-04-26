import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DoctorProfile } from "../lib/auth-api";

interface ProfileState {
  fullName: string;
  email: string;
  contactNumber: string;
  specialty: string;
  licenseNumber: string;
  hospital: string;
  avatarUrl: string | null;
  setProfile: (data: Partial<Omit<ProfileState, "setProfile">>) => void;
  hydrateFromDoctor: (doctor: DoctorProfile) => void;
  resetProfile: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      fullName: "",
      email: "",
      contactNumber: "",
      specialty: "",
      licenseNumber: "",
      hospital: "",
      avatarUrl: null,
      setProfile: (data) => set((s) => ({ ...s, ...data })),
      hydrateFromDoctor: (doctor) =>
        set({
          fullName: doctor.full_name ?? "",
          email: doctor.email ?? "",
          contactNumber: doctor.contact_number ?? "",
          specialty: doctor.specialty ?? "",
          licenseNumber: doctor.license_number ?? "",
          hospital: doctor.hospital ?? "",
          avatarUrl: doctor.avatar_url ?? null,
        }),
      resetProfile: () =>
        set({
          fullName: "",
          email: "",
          contactNumber: "",
          specialty: "",
          licenseNumber: "",
          hospital: "",
          avatarUrl: null,
        }),
    }),
    { name: "refai-profile" },
  ),
);
