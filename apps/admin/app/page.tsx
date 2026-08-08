"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { getAdminToken, clearAdminToken, adminApi } from "../lib/api";

type Tab = "accounts" | "transactions" | "audit";

export default function AdminConsole() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("accounts");

  useEffect(() => {
    if (!getAdminToken()) router.replace("/login");
  }, [router]);

  function handleLogout() {
    clearAdminToken();
    router.replace("/login");
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
            MERIDIAN — OPERATIONS
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, margin: "6px 0 0", fontWeight: 600 }}>
            Admin console
          </h1>
        </div>
        <button onClick={handleLogout} style={logoutButton}>Log out</button>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["accounts", "transactions", "audit"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tab === t ? tabActive : tabInactive}>
            {t === "accounts" ? "Accounts" : t === "transactions" ? "Transactions" : "Audit log"}
          </button>
        ))}
      </div>

      {tab === "accounts" && <AccountsPanel />}
      {tab === "transactions" && <TransactionsPanel />}
      {tab === "audit" && <AuditLogPanel />}
    </main>
  );
}

function formatCents(cents: string) {
  return (Number(cents) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// ---------- Accounts ----------
function AccountsPanel() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { accounts } = await adminApi.getAccounts();
      setAccounts(accounts);
    } catch (err: any) {
      setError(err.message || "Couldn't load accounts.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFreeze(account: any) {
    const reason = window.prompt(account.status === "FROZEN" ? "Reason for unfreezing:" : "Reason for freezing:");
    if (!reason) return;
    setBusyId(account.id);
    try {
      if (account.status === "FROZEN") {
        await adminApi.unfreezeAccount(account.id, reason);
      } else {
        await adminApi.freezeAccount(account.id, reason);
      }
      await load();
    } catch (err: any) {
      alert(err.message || "Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} onRetry={load} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {accounts.length === 0 && <EmptyPanel message="No accounts found." />}
      {accounts.map((a) => (
        <GlassPanel key={a.id} style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15 }}>
              {a.user?.firstName} {a.user?.lastName} <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>· {a.user?.email}</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              •••• {a.accountNumber.slice(-4)} · {formatCents(a.balanceCents)}
            </div>
            <StatusBadge status={a.status} />
          </div>
          <button onClick={() => toggleFreeze(a)} disabled={busyId === a.id} style={a.status === "FROZEN" ? secondaryButton : dangerButton}>
            {busyId === a.id ? "…" : a.status === "FROZEN" ? "Unfreeze" : "Freeze"}
          </button>
        </GlassPanel>
      ))}
    </div>
  );
}

// ---------- Transactions ----------
function TransactionsPanel() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getTransactions()
      .then((r) => setTransactions(r.transactions))
      .catch((err) => setError(err.message || "Couldn't load transactions."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {transactions.length === 0 && <EmptyPanel message="No transactions yet." />}
      {transactions.map((t) => (
        <GlassPanel key={t.id} style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14 }}>{t.description}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              •••• {t.account?.accountNumber?.slice(-4)} · {new Date(t.createdAt).toLocaleString("en-US")}
            </div>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", color: t.type === "CREDIT" ? "var(--credit-500)" : "var(--text-primary)" }}>
            {t.type === "CREDIT" ? "+" : "−"} {formatCents(t.amountCents)}
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

// ---------- Audit log ----------
function AuditLogPanel() {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getAuditLog()
      .then((r) => setActions(r.actions))
      .catch((err) => setError(err.message || "Couldn't load the audit log."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {actions.length === 0 && <EmptyPanel message="No admin actions logged yet." />}
      {actions.map((a) => (
        <GlassPanel key={a.id} style={{ padding: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{a.actionType.replaceAll("_", " ")}</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
            by {a.actor?.firstName} {a.actor?.lastName} · {new Date(a.createdAt).toLocaleString("en-US")}
          </div>
          {a.details?.reason && (
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>“{a.details.reason}”</div>
          )}
        </GlassPanel>
      ))}
    </div>
  );
}

// ---------- shared bits ----------
function StatusBadge({ status }: { status: string }) {
  const color = status === "ACTIVE" ? "var(--credit-500)" : status === "FROZEN" ? "var(--debit-500)" : "var(--text-tertiary)";
  return <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600, letterSpacing: 0.4 }}>{status}</div>;
}

function LoadingPanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ height: 70, borderRadius: "var(--radius-chip)", background: "var(--glass-fill)" }} />)}
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <GlassPanel style={{ padding: 20 }}>
      <div style={{ color: "var(--debit-500)", fontSize: 14, marginBottom: onRetry ? 10 : 0 }}>{message}</div>
      {onRetry && <button onClick={onRetry} style={secondaryButton}>Try again</button>}
    </GlassPanel>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <GlassPanel style={{ padding: 20, textAlign: "center" }}>
      <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>{message}</div>
    </GlassPanel>
  );
}

const logoutButton: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, cursor: "pointer",
};
const secondaryButton: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const dangerButton: React.CSSProperties = {
  padding: "8px 14px", borderRadius: 10, border: "1px solid var(--debit-500)",
  background: "transparent", color: "var(--debit-500)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const tabActive: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 10, border: "none", background: "var(--signal-500)",
  color: "white", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
const tabInactive: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 10, border: "1px solid var(--glass-border)", background: "transparent",
  color: "var(--text-secondary)", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
