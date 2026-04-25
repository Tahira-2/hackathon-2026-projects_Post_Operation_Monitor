import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileState {
  fullName: string;
  specialty: string;
  avatarUrl: string | null;
  setProfile: (data: Partial<Omit<ProfileState, "setProfile">>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      fullName: "Dr. Jameson",
      specialty: "",
      avatarUrl: null,
      setProfile: (data) => set((s) => ({ ...s, ...data })),
    }),
    { name: "refai-profile" },
  ),
);
