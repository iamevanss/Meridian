"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { adminApi, setAdminToken } from "../../lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await adminApi.login({ email, password });
      setAdminToken(result.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "64px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
          MERIDIAN — OPERATIONS
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "6px 0 0", fontWeight: 600 }}>
          Admin sign in
        </h1>
      </div>

      <GlassPanel raised style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input style={input} type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <div style={{ color: "var(--debit-500)", fontSize: 14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </GlassPanel>

      <p style={{ textAlign: "center", marginTop: 20, color: "var(--text-tertiary)", fontSize: 13 }}>
        Restricted access. Admin accounts are provisioned manually.
      </p>
    </main>
  );
}

const input: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  outline: "none",
};

const primaryButton: React.CSSProperties = {
  padding: "13px 0",
  borderRadius: 14,
  border: "none",
  background: "var(--signal-500)",
  color: "white",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  marginTop: 4,
};
