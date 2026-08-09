"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { api } from "../../lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.resetPassword({ email, dateOfBirth, phoneNumber, newPassword });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Couldn't reset your password.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main style={{ maxWidth: 420, margin: "0 auto", padding: "64px 20px" }}>
        <GlassPanel raised style={{ padding: 32, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(53,208,127,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--credit-500)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: "0 0 6px" }}>Password reset</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>
            You can now log in with your new password.
          </p>
          <button onClick={() => router.push("/login")} style={primaryButton}>Go to login</button>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/login")} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Reset password</h1>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
        Confirm the details on your account and choose a new password.
      </p>

      <GlassPanel raised style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Email address">
            <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Date of birth">
            <input style={input} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          </Field>
          <Field label="Phone number">
            <input style={input} type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </Field>
          <Field label="New password">
            <input style={input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </Field>

          {error && <div style={{ color: "var(--debit-500)", fontSize: 14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </GlassPanel>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
  fontSize: 15, outline: "none", boxSizing: "border-box",
};
const primaryButton: React.CSSProperties = {
  padding: "13px 0", borderRadius: 14, border: "none", background: "var(--signal-500)",
  color: "white", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, cursor: "pointer",
};
const backButton: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontSize: 16, cursor: "pointer",
};
