"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { getToken, api } from "../../lib/api";

interface Account {
  id: string;
  nickname: string | null;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  balanceCents: string;
}

export default function TransferPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ amount: string; newBalanceCents: string } | null>(null);
  const [recipient, setRecipient] = useState<{ firstName: string; lastInitial: string; accountType: string; status: string } | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Debounced lookup: fires 400ms after the user stops typing a full 10-digit number
  useEffect(() => {
    setRecipient(null);
    setRecipientError(null);

    if (!/^\d{10}$/.test(toAccountNumber)) return;

    setLookingUp(true);
    const timer = setTimeout(() => {
      api.lookupAccount(toAccountNumber)
        .then((r) => setRecipient(r))
        .catch((err) => setRecipientError(err.status === 404 ? "No Meridian account found with this number." : "Couldn't look up this account."))
        .finally(() => setLookingUp(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [toAccountNumber]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api.getAccounts()
      .then((r) => {
        setAccounts(r.accounts);
        if (r.accounts.length > 0) setFromAccountId(r.accounts[0].id);
      })
      .catch((err) => setError(err.message || "Couldn't load your accounts."))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amountDollars = parseFloat(amount);
    if (isNaN(amountDollars) || amountDollars <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!/^\d{10}$/.test(toAccountNumber)) {
      setError("Account numbers are 10 digits.");
      return;
    }
    if (!recipient) {
      setError("Please confirm the recipient before sending.");
      return;
    }
    if (recipient.status !== "ACTIVE") {
      setError("This account can't currently receive transfers.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.transfer({
        fromAccountId,
        toAccountNumber,
        amountDollars,
        description: description || "Transfer",
      });
      setSuccess({ amount, newBalanceCents: result.newBalanceCents });
    } catch (err: any) {
      setError(err.message || "Transfer failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main style={{ maxWidth: 440, margin: "0 auto", padding: "64px 20px" }}>
        <GlassPanel raised style={{ padding: 32, textAlign: "center" }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%", background: "rgba(53,208,127,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--credit-500)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: "0 0 6px" }}>
            Sent ${Number(success.amount).toFixed(2)}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>
            To account •••• {toAccountNumber.slice(-4)}
          </p>
          <button onClick={() => router.push("/")} style={primaryButton}>Back to dashboard</button>
        </GlassPanel>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 440, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Send money</h1>
      </div>

      {loading ? (
        <div style={{ height: 300, borderRadius: "var(--radius-panel)", background: "var(--glass-fill)" }} />
      ) : (
        <GlassPanel raised style={{ padding: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="From">
              <select style={input} value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} required>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nickname || a.type} · •••• {a.accountNumber.slice(-4)} · {(Number(a.balanceCents) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="To account number">
              <input
                style={input}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit account number"
                value={toAccountNumber}
                onChange={(e) => setToAccountNumber(e.target.value.replace(/\D/g, ""))}
                required
              />
            </Field>

            {lookingUp && (
              <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Looking up account…</div>
            )}
            {!lookingUp && recipient && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(53,208,127,0.10)", border: "1px solid rgba(53,208,127,0.3)" }}>
                <span style={{ color: "var(--credit-500)", fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 14, color: "var(--text-primary)" }}>
                  Sending to <strong>{recipient.firstName} {recipient.lastInitial}.</strong>
                  {recipient.status !== "ACTIVE" && <span style={{ color: "var(--debit-500)" }}> — account {recipient.status.toLowerCase()}</span>}
                </span>
              </div>
            )}
            {!lookingUp && recipientError && (
              <div style={{ fontSize: 13, color: "var(--debit-500)" }}>{recipientError}</div>
            )}

            <Field label="Amount">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}>$</span>
                <input
                  style={{ ...input, paddingLeft: 26 }}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  required
                />
              </div>
            </Field>

            <Field label="What's it for? (optional)">
              <input style={input} placeholder="e.g. Rent, dinner, gift" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} />
            </Field>

            {error && <div style={{ color: "var(--debit-500)", fontSize: 14 }}>{error}</div>}

            <button type="submit" disabled={submitting || accounts.length === 0 || !recipient} style={primaryButton}>
              {submitting ? "Sending…" : "Send money"}
            </button>
          </form>
        </GlassPanel>
      )}
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
};

const backButton: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontSize: 16, cursor: "pointer",
};
