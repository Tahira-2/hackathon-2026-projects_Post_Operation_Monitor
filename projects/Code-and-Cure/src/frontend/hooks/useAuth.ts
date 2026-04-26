"use client";

import { useEffect, useState } from "react";
import { setStoredToken, clearStoredToken, getStoredToken } from "@/lib/api";

export type Role = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  role: Role;
}

const DEMO_CREDENTIALS = {
  patient: { email: "patient@demo.careit.com", password: "Demo1234!", full_name: "John Patient" },
  doctor: { email: "doctor@demo.careit.com", password: "Demo1234!", full_name: "Dr. Sarah Chen" },
};

function cookieRole(): Role | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((r) => r.startsWith("token="))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    return JSON.parse(raw).role as Role;
  } catch {
    return null;
  }
}

function setRoleCookie(role: Role) {
  document.cookie = `token=${JSON.stringify({ role })}; path=/`;
}

function clearRoleCookie() {
  document.cookie = "token=; Max-Age=0; path=/";
}

async function apiLogin(email: string, password: string) {
  const res = await fetch("http://localhost:8000/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json() as Promise<{ access_token: string; role: string }>;
}

async function apiRegister(email: string, password: string, full_name: string, role: string) {
  const res = await fetch("http://localhost:8000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, full_name, role }),
  });
  // 400 means already registered — that's fine for demo bootstrap
  if (!res.ok && res.status !== 400) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = cookieRole();
    const token = getStoredToken();
    if (role && token) {
      setUser({ id: "me", name: role === "patient" ? "John Patient" : "Dr. Sarah Chen", role });
    } else if (role) {
      setUser({ id: "demo", name: role === "patient" ? "John Patient" : "Dr. Sarah Chen", role });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const data = await apiLogin(email, password);
    setStoredToken(data.access_token);
    setRoleCookie(data.role as Role);
    const u: User = {
      id: "me",
      name: data.role === "patient" ? "John Patient" : "Dr. Sarah Chen",
      role: data.role as Role,
    };
    setUser(u);
    window.location.href = data.role === "patient" ? "/patient/dashboard" : "/doctor/dashboard";
  };

  // Demo quick-login: auto-registers then logs in with seeded credentials
  const demoLogin = async (role: Role): Promise<void> => {
    const creds = DEMO_CREDENTIALS[role];
    await apiRegister(creds.email, creds.password, creds.full_name, role);
    const data = await apiLogin(creds.email, creds.password);
    setStoredToken(data.access_token);
    setRoleCookie(role);
    setUser({ id: "me", name: creds.full_name, role });
    window.location.href = role === "patient" ? "/patient/dashboard" : "/doctor/dashboard";
  };

  const logout = () => {
    clearStoredToken();
    clearRoleCookie();
    setUser(null);
    window.location.href = "/";
  };

  return { user, loading, login, demoLogin, logout };
}
