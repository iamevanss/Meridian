"use client";

import { GlassPanel, LedgerRow } from "@meridian/ui";

// Placeholder data — replace with a real fetch to
// `${NEXT_PUBLIC_API_URL}/accounts` and `/accounts/:id/transactions`
// once auth (login page + token storage) is wired up.
const demoAccount = {
  nickname: "Everyday Checking",
  accountNumber: "4471 •••• 92",
  balanceCents: 348210n,
};

const demoTransactions = [
  { type: "CREDIT" as const, description: "Payroll deposit", memo: "Acme Inc.", amountCents: 285000n, date: "2026-08-07T09:00:00Z" },
  { type: "DEBIT" as const, description: "Transfer to Savings", amountCents: 50000n, date: "2026-08-06T14:32:00Z" },
  { type: "DEBIT" as const, description: "Grocery Co.", memo: "Card •• 4821", amountCents: 6742n, date: "2026-08-05T18:11:00Z" },
  { type: "CREDIT" as const, description: "Transfer from Sam R.", amountCents: 12000n, date: "2026-08-04T11:02:00Z" },
];

export default function DashboardPage() {
  const dollars = (Number(demoAccount.balanceCents) / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 80px" }}>
      <header style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
          MERIDIAN
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "6px 0 0", fontWeight: 600 }}>
          Good evening, Alex
        </h1>
      </header>

      <GlassPanel raised style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
          {demoAccount.nickname} · {demoAccount.accountNumber}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
            fontSize: 42,
            fontWeight: 600,
            marginTop: 8,
            letterSpacing: -1,
          }}
        >
          {dollars}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button style={primaryButton}>Send money</button>
          <button style={secondaryButton}>Request</button>
        </div>
      </GlassPanel>

      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 12px 4px" }}>
        Recent activity
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {demoTransactions.map((tx, i) => (
          <LedgerRow key={i} index={i} {...tx} />
        ))}
      </div>
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  borderRadius: 14,
  border: "none",
  background: "var(--signal-500)",
  color: "white",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  flex: 1,
  padding: "12px 0",
  borderRadius: 14,
  border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
};
