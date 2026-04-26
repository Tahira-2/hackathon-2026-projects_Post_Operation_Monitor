"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<"patient" | "doctor" | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  const handleDemo = async (role: "patient" | "doctor") => {
    setError(null);
    setDemoLoading(role);
    try {
      await demoLogin(role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo login failed");
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">CareIT</h1>
          <p className="text-gray-500 text-sm mt-1">The Interoperable Bridge for Solo Practitioners</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg py-2 transition disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-2">Quick Demo Login</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemo("patient")}
              disabled={demoLoading !== null}
              className="border border-green-400 text-green-700 rounded-lg py-2 text-sm font-medium hover:bg-green-50 transition disabled:opacity-50"
            >
              {demoLoading === "patient" ? "Loading…" : "Patient Demo"}
            </button>
            <button
              onClick={() => handleDemo("doctor")}
              disabled={demoLoading !== null}
              className="border border-blue-400 text-blue-700 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 transition disabled:opacity-50"
            >
              {demoLoading === "doctor" ? "Loading…" : "Doctor Demo"}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Demo accounts are auto-created on first use.
          </p>
        </div>
      </div>
    </div>
  );
}
