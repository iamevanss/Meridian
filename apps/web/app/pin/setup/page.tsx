"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { getToken, api } from "../../../lib/api";
import { useEffect } from "react";

export default function PinSetupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits.");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.setPin({ password, pin });
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Couldn't set your PIN. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main style={{ maxWidth: 420, margin: "0 auto", padding: "64px 20px" }}>
        <GlassPanel raised style={{ padding: 32, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(53,208,127,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--credit-500)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: "0 0 6px" }}>PIN set</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>
            You'll need this PIN to confirm every transfer from now on.
          </p>
          <button onClick={() => router.push("/")} style={primaryButton}>Back to dashboard</button>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Set transaction PIN</h1>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 20 }}>
        Your PIN is a second layer of security, separate from your password — you'll enter it to confirm every transfer.
      </p>

      <GlassPanel raised style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Account password">
            <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <Field label="New PIN (4-6 digits)">
            <input style={{ ...input, letterSpacing: 4 }} inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} required />
          </Field>
          <Field label="Confirm PIN">
            <input style={{ ...input, letterSpacing: 4 }} inputMode="numeric" maxLength={6} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} required />
          </Field>

          {error && <div style={{ color: "var(--debit-500)", fontSize: 14 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={primaryButton}>
            {submitting ? "Saving…" : "Set PIN"}
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
