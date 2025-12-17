"use client";

import { FormEvent, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";

type Mode = "login" | "register";

const modeCopy: Record<Mode, { title: string; cta: string; helper: string; toggle: string }> = {
  login: {
    title: "Welcome back",
    cta: "Sign in",
    helper: "Don't have an account?",
    toggle: "Create one",
  },
  register: {
    title: "Claim your handle",
    cta: "Create account",
    helper: "Already registered?",
    toggle: "Sign in instead",
  },
};

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, login, loading, error, clearError } = useAuthStore((state) => ({
    register: state.register,
    login: state.login,
    loading: state.loading,
    error: state.error,
    clearError: state.clearError,
  }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!username || !password) {
      setLocalError("Enter a username and password.");
      return;
    }

    try {
      if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      setUsername("");
      setPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to authenticate.";
      setLocalError(message);
    }
  };

  const switchMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setLocalError(null);
    clearError();
  };

  const copy = modeCopy[mode];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-slate-950/50">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">DopeWars</p>
          <h1 className="mt-2 text-3xl font-bold">{copy.title}</h1>
          <p className="text-sm text-slate-400">Secure your alias to jump into the multiplayer streets.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-base text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Crew handle"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-base text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Secret phrase"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {(localError || error) && (
            <p className="text-sm text-rose-400">{localError || error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "One sec..." : copy.cta}
          </button>
        </form>

        <div className="text-center text-sm text-slate-400">
          {copy.helper}{" "}
          <button type="button" className="font-semibold text-blue-400 hover:text-blue-300" onClick={switchMode}>
            {copy.toggle}
          </button>
        </div>
      </div>
    </div>
  );
}
