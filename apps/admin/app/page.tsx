"use client";

import { GlassPanel } from "@meridian/ui";

// Placeholder — wire this to POST ${NEXT_PUBLIC_API_URL}/auth/admin/login,
// store the returned token separately from the customer app's token
// (different storage key, e.g. "meridian_admin_token"), then fetch
// /admin/accounts, /admin/transactions, /admin/audit-log.

export default function AdminHome() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
        MERIDIAN — OPERATIONS
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "6px 0 24px", fontWeight: 600 }}>
        Admin console
      </h1>

      <GlassPanel style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, marginBottom: 6 }}>Accounts</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          View, freeze/unfreeze, and adjust balances. Connect to GET /admin/accounts.
        </div>
      </GlassPanel>

      <GlassPanel style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, marginBottom: 6 }}>Transactions</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          System-wide ledger feed. Connect to GET /admin/transactions.
        </div>
      </GlassPanel>

      <GlassPanel style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, marginBottom: 6 }}>Audit log</div>
        <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Every admin action, immutable. Connect to GET /admin/audit-log.
        </div>
      </GlassPanel>
    </main>
  );
}
