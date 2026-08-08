import React from "react";
import { motion } from "framer-motion";

export interface LedgerRowProps {
  type: "DEBIT" | "CREDIT";
  description: string;
  memo?: string;
  amountCents: bigint | string;
  date: string; // ISO string
  index?: number; // for stagger animation
}

function formatAmount(cents: bigint | string) {
  const n = typeof cents === "bigint" ? cents : BigInt(cents);
  const dollars = Number(n) / 100;
  return dollars.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/**
 * Signature element: a frosted "ledger chip" for a single transaction.
 * A colored edge-glow (mint for credit, coral for debit) is the entire
 * signal — no separate icon needed, the color + sign says everything at
 * a glance, the way real bank statements do.
 */
export function LedgerRow({ type, description, memo, amountCents, date, index = 0 }: LedgerRowProps) {
  const isCredit = type === "CREDIT";
  const glow = isCredit ? "var(--credit-glow)" : "var(--debit-glow)";
  const accent = isCredit ? "var(--credit-500)" : "var(--debit-500)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 18px",
        borderRadius: "var(--radius-chip)",
        background: "var(--glass-fill)",
        border: "1px solid var(--glass-border)",
        boxShadow: `inset 3px 0 0 0 ${accent}, 0 0 24px -8px ${glow}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {description}
        </div>
        {memo && (
          <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>
            {memo}
          </div>
        )}
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
          {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontVariantNumeric: "tabular-nums",
          fontSize: 16,
          fontWeight: 600,
          color: isCredit ? "var(--credit-500)" : "var(--text-primary)",
          whiteSpace: "nowrap",
        }}
      >
        {isCredit ? "+" : "−"} {formatAmount(amountCents)}
      </div>
    </motion.div>
  );
}
