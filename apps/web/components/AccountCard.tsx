"use client";

import { GlassPanel } from "@meridian/ui";

interface AccountCardProps {
  nickname: string | null;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  balanceCents: string;
  active?: boolean;
  onClick?: () => void;
}

export function AccountCard({ nickname, type, accountNumber, balanceCents, active, onClick }: AccountCardProps) {
  const dollars = (Number(balanceCents) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const isSavings = type === "SAVINGS";

  return (
    <button onClick={onClick} style={{ all: "unset", cursor: onClick ? "pointer" : "default", flexShrink: 0, width: 280 }}>
      <GlassPanel
        raised
        style={{
          padding: 22,
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: active ? "1px solid var(--signal-400)" : "1px solid var(--glass-border)",
          background: isSavings
            ? "linear-gradient(135deg, rgba(53,208,127,0.10), var(--glass-fill-raised))"
            : "linear-gradient(135deg, rgba(62,123,250,0.12), var(--glass-fill-raised))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)" }}>
              {nickname || (isSavings ? "Savings" : "Checking")}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
              •••• {accountNumber.slice(-4)}
            </div>
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              padding: "4px 8px",
              borderRadius: 8,
              background: isSavings ? "rgba(53,208,127,0.18)" : "rgba(62,123,250,0.18)",
              color: isSavings ? "var(--credit-500)" : "var(--signal-400)",
            }}
          >
            {type}
          </div>
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontVariantNumeric: "tabular-nums",
            fontSize: 30,
            fontWeight: 600,
            letterSpacing: -0.5,
            color: "var(--text-primary)",
          }}
        >
          {dollars}
        </div>
      </GlassPanel>
    </button>
  );
}
