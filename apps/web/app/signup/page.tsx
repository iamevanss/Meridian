"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { api, setToken } from "../../lib/api";

const GENDERS = [
  { value: "FEMALE", label: "Female" },
  { value: "MALE", label: "Male" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    gender: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.gender) {
      setError("Please select a gender option.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.signup(form);
      setToken(result.token);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <img src="/brand/logo-mark.svg" alt="Meridian" width={56} height={56} style={{ borderRadius: 16 }} />
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-tertiary)", letterSpacing: 0.5, marginTop: 12 }}>
          MERIDIAN
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, margin: "4px 0 0", fontWeight: 600 }}>
          Create your account
        </h1>
      </div>

      <GlassPanel raised style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Section title="Personal details">
            <Row>
              <Field label="First name">
                <input style={input} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
              </Field>
              <Field label="Last name">
                <input style={input} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
              </Field>
            </Row>

            <Row>
              <Field label="Date of birth">
                <input style={input} type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} required />
              </Field>
              <Field label="Gender">
                <select style={input} value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
                  <option value="" disabled>Select</option>
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
            </Row>
          </Section>

          <Section title="Contact information">
            <Field label="Phone number">
              <input style={input} type="tel" placeholder="(555) 123-4567" value={form.phoneNumber} onChange={(e) => update("phoneNumber", e.target.value)} required />
            </Field>
            <Field label="Email address">
              <input style={input} type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </Field>
          </Section>

          <Section title="Security">
            <Field label="Password">
              <input style={input} type="password" placeholder="Minimum 8 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={8} />
            </Field>
          </Section>

          {error && <div style={{ color: "var(--debit-500)", fontSize: 14 }}>{error}</div>}

          <button type="submit" disabled={loading} style={primaryButton}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", margin: 0 }}>
            You must be 18 or older to open a Meridian account.
          </p>
        </form>
      </GlassPanel>

      <p style={{ textAlign: "center", marginTop: 20, color: "var(--text-secondary)", fontSize: 14 }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "var(--signal-400)" }}>Log in</a>
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-tertiary)", letterSpacing: 0.6, marginBottom: 10, textTransform: "uppercase" }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 10 }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
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
