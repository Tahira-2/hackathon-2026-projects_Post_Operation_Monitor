"use client";

import Button from "@/components/shared/Button";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { login } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-bold">Telehealth App</h1>

      <Button onClick={() => login("patient")}>
        I am a Patient
      </Button>

      <Button onClick={() => login("doctor")}>
        I am a Doctor
      </Button>
    </div>
  );
}