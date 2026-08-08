"use client";

import { GlassPanel } from "@meridian/ui";

interface Tx {
  type: "DEBIT" | "CREDIT";
  amountCents: string;
  createdAt: string;
}

/**
 * A lightweight 7-day spending bar chart built from real transaction data —
 * no charting library needed, just divs sized by relative spend per day.
 */
export function SpendingChart({ transactions }: { transactions: Tx[] }) {
  const days: { label: string; totalCents: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const totalCents = transactions
      .filter((t) => t.type === "DEBIT")
      .filter((t) => {
        const ts = new Date(t.createdAt).getTime();
        return ts >= dayStart && ts < dayEnd;
      })
      .reduce((sum, t) => sum + Number(t.amountCents), 0);

    days.push({ label, totalCents });
  }

  const max = Math.max(...days.map((d) => d.totalCents), 1);
  const weekTotal = days.reduce((sum, d) => sum + d.totalCents, 0);

  return (
    <GlassPanel style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>Spending, last 7 days</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600 }}>
          {(weekTotal / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: "100%",
                height: Math.max(4, (d.totalCents / max) * 72),
                borderRadius: 6,
                background: d.totalCents > 0
                  ? "linear-gradient(180deg, var(--signal-400), var(--signal-500))"
                  : "var(--glass-fill)",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
