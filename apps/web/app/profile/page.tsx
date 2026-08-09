"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { getToken, clearToken, getUser, api } from "../../lib/api";

const GENDERS = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

interface Me {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  email: string;
  dateOfBirth: string | null;
  gender: string | null;
  hasPin: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api.getMe()
      .then((r) => {
        setMe(r.user);
        setEmail(r.user.email);
        setDateOfBirth(r.user.dateOfBirth ? r.user.dateOfBirth.slice(0, 10) : "");
        setGender(r.user.gender || "");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg(null);
    setSaving(true);
    try {
      const r = await api.updateProfile({ email, dateOfBirth, gender });
      setMe(r.user);
      setSaveMsg({ type: "ok", text: "Profile updated." });
    } catch (err: any) {
      setSaveMsg({ type: "err", text: err.message || "Couldn't save changes." });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    setPwSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPwMsg({ type: "ok", text: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwMsg({ type: "err", text: err.message || "Couldn't change password." });
    } finally {
      setPwSaving(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px" }}>
        <div style={{ height: 400, borderRadius: "var(--radius-panel)", background: "var(--glass-fill)" }} />
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Profile</h1>
      </div>

      {/* Personal information */}
      <SectionLabel>Personal information</SectionLabel>
      <GlassPanel style={{ padding: 20, marginBottom: 20 }}>
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <LockedField label="First name" value={me?.firstName || ""} />
          <LockedField label="Last name" value={me?.lastName || ""} />
          <LockedField label="Phone number" value={me?.phoneNumber || ""} />

          <Field label="Email address">
            <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Date of birth">
            <input style={input} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
          </Field>
          <Field label="Gender">
            <select style={input} value={gender} onChange={(e) => setGender(e.target.value)} required>
              {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </Field>

          {saveMsg && <div style={{ fontSize: 13, color: saveMsg.type === "ok" ? "var(--credit-500)" : "var(--debit-500)" }}>{saveMsg.text}</div>}

          <button type="submit" disabled={saving} style={primaryButton}>{saving ? "Saving…" : "Save changes"}</button>
        </form>
      </GlassPanel>

      {/* Security */}
      <SectionLabel>Security</SectionLabel>
      <GlassPanel style={{ padding: 20, marginBottom: 20 }}>
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Change password</div>
          <Field label="Current password">
            <input style={input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </Field>
          <Field label="New password">
            <input style={input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </Field>
          {pwMsg && <div style={{ fontSize: 13, color: pwMsg.type === "ok" ? "var(--credit-500)" : "var(--debit-500)" }}>{pwMsg.text}</div>}
          <button type="submit" disabled={pwSaving} style={secondaryButton}>{pwSaving ? "Saving…" : "Update password"}</button>
        </form>

        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Transaction PIN</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{me?.hasPin ? "PIN is set" : "No PIN set yet"}</div>
          </div>
          <button onClick={() => router.push("/pin/setup")} style={secondaryButton}>{me?.hasPin ? "Change PIN" : "Set PIN"}</button>
        </div>
      </GlassPanel>

      {/* Legal */}
      <SectionLabel>Legal</SectionLabel>
      <GlassPanel style={{ padding: 4, marginBottom: 24 }}>
        <button onClick={() => router.push("/terms")} style={rowButton}>
          <span>Terms & Conditions</span>
          <span style={{ color: "var(--text-tertiary)" }}>›</span>
        </button>
      </GlassPanel>

      <button onClick={handleLogout} style={logoutButton}>Log out</button>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: 0.6, margin: "0 0 10px 4px", textTransform: "uppercase" }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</div>
      <div style={{ ...input, display: "flex", alignItems: "center", justifyContent: "space-between", color: "var(--text-tertiary)", cursor: "not-allowed" }}>
        <span>{value}</span>
        <span style={{ fontSize: 16 }}>🔒</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Contact support to change this.</div>
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
  fontSize: 15, outline: "none", boxSizing: "border-box",
};
const primaryButton: React.CSSProperties = {
  padding: "12px 0", borderRadius: 14, border: "none", background: "var(--signal-500)",
  color: "white", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, cursor: "pointer",
};
const secondaryButton: React.CSSProperties = {
  padding: "10px 16px", borderRadius: 12, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
  fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
};
const logoutButton: React.CSSProperties = {
  width: "100%", padding: "13px 0", borderRadius: 14, border: "1px solid var(--debit-500)",
  background: "transparent", color: "var(--debit-500)", fontFamily: "var(--font-body)",
  fontWeight: 600, fontSize: 15, cursor: "pointer",
};
const backButton: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontSize: 16, cursor: "pointer",
};
const rowButton: React.CSSProperties = {
  all: "unset", width: "100%", boxSizing: "border-box", padding: "14px 16px", display: "flex",
  justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontSize: 14, color: "var(--text-primary)",
};
