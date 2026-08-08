"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel, LedgerRow } from "@meridian/ui";
import { getToken, clearToken, api } from "../lib/api";

interface Account {
  id: string;
  nickname: string | null;
  accountNumber: string;
  balanceCents: string;
}

interface Transaction {
  id: string;
  type: "DEBIT" | "CREDIT";
  description: string;
  memo?: string;
  amountCents: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    loadDashboard();
  }, [router]);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const { accounts } = await api.getAccounts();
      setAccounts(accounts);

      if (accounts.length > 0) {
        const { transactions } = await api.getTransactions(accounts[0].id);
        setTransactions(transactions);
      }
    } catch (err: any) {
      if (err.status === 401) {
        clearToken();
        router.replace("/login");
        return;
      }
      setError(err.message || "Couldn't load your accounts. Pull to refresh, or try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  const primary = accounts[0];
  const dollars = primary
    ? (Number(primary.balanceCents) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })
    : "—";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 80px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-tertiary)", letterSpacing: 0.5 }}>
            MERIDIAN
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, margin: "6px 0 0", fontWeight: 600 }}>
            Your accounts
          </h1>
        </div>
        <button onClick={handleLogout} style={logoutButton}>Log out</button>
      </header>

      {loading && <SkeletonState />}

      {!loading && error && (
        <GlassPanel style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ color: "var(--debit-500)", fontSize: 14, marginBottom: 10 }}>{error}</div>
          <button onClick={loadDashboard} style={secondaryButton}>Try again</button>
        </GlassPanel>
      )}

      {!loading && !error && !primary && (
        <GlassPanel style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--text-secondary)" }}>No accounts found on this profile yet.</div>
        </GlassPanel>
      )}

      {!loading && !error && primary && (
        <>
          <GlassPanel raised style={{ padding: 28, marginBottom: 24 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--text-secondary)" }}>
              {primary.nickname || "Checking"} · •••• {primary.accountNumber.slice(-4)}
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

          {transactions.length === 0 ? (
            <GlassPanel style={{ padding: 20, textAlign: "center" }}>
              <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No transactions yet.</div>
            </GlassPanel>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {transactions.map((tx, i) => (
                <LedgerRow
                  key={tx.id}
                  index={i}
                  type={tx.type}
                  description={tx.description}
                  memo={tx.memo}
                  amountCents={tx.amountCents}
                  date={tx.createdAt}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function SkeletonState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ height: 160, borderRadius: "var(--radius-panel)", background: "var(--glass-fill)", marginBottom: 14 }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ height: 64, borderRadius: "var(--radius-chip)", background: "var(--glass-fill)" }} />
      ))}
    </div>
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

const logoutButton: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid var(--glass-border)",
  background: "transparent",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  cursor: "pointer",
};
