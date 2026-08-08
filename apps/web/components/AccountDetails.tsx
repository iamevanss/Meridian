"use client";

import { useState } from "react";
import { GlassPanel } from "@meridian/ui";

interface AccountDetailsProps {
  nickname: string | null;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  routingCode: string;
}

export function AccountDetails({ nickname, type, accountNumber, routingCode }: AccountDetailsProps) {
  const [copied, setCopied] = useState<"account" | "routing" | null>(null);

  async function copy(value: string, which: "account" | "routing") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard API can fail on some mobile browsers without a user gesture context —
      // the number is still visible on screen to copy manually as a fallback.
    }
  }

  return (
    <GlassPanel style={{ padding: 20 }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
        Account details · {nickname || type}
      </div>

      <DetailRow
        label="Account number"
        value={accountNumber}
        copied={copied === "account"}
        onCopy={() => copy(accountNumber, "account")}
      />
      <DetailRow
        label="Routing number"
        value={routingCode}
        copied={copied === "routing"}
        onCopy={() => copy(routingCode, "routing")}
      />

      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12 }}>
        Share these with someone sending you money, or with a payroll provider for direct deposit.
      </div>
    </GlassPanel>
  );
}

function DetailRow({ label, value, copied, onCopy }: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--glass-border)" }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: 0.5, marginTop: 2 }}>{value}</div>
      </div>
      <button onClick={onCopy} style={copyButton}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

const copyButton: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 10,
  border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)",
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
