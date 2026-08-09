"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel, LedgerRow } from "@meridian/ui";
import { getToken, clearToken, getUser, api } from "../lib/api";
import { AccountCard } from "../components/AccountCard";
import { QuickActions } from "../components/QuickActions";
import { BottomNav } from "../components/BottomNav";
import { AccountDetails } from "../components/AccountDetails";
import { SpendingChart } from "../components/SpendingChart";
import { NotificationBell } from "../components/NotificationBell";

interface Account {
  id: string;
  nickname: string | null;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  routingCode: string;
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
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    loadAccounts();
  }, [router]);

  async function loadAccounts() {
    setLoading(true);
    setError(null);
    try {
      const { accounts } = await api.getAccounts();
      setAccounts(accounts);
      if (accounts.length > 0) {
        setActiveAccountId(accounts[0].id);
        await loadTransactions(accounts[0].id);
      }
    } catch (err: any) {
      if (err.status === 401) {
        clearToken();
        router.replace("/login");
        return;
      }
      setError(err.message || "Couldn't load your accounts.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions(accountId: string) {
    try {
      const { transactions } = await api.getTransactions(accountId);
      setTransactions(transactions);
    } catch {
      // non-fatal — accounts still show even if transaction history fails
    }
  }

  function handleQuickAction(key: string) {
    if (key === "send") {
      router.push("/transfer");
    } else if (key === "cards") {
      router.push("/cards");
    } else if (key === "request") {
      router.push("/coming-soon?feature=Request%20money");
    } else if (key === "pay") {
      router.push("/coming-soon?feature=Pay%20bills");
    }
  }

  function handleNavSelect(key: string) {
    if (key === "home") return;
    if (key === "transfers") {
      router.push("/activity");
    } else if (key === "profile") {
      router.push("/profile");
    } else if (key === "cards") {
      router.push("/cards");
    }
  }

  const active = accounts.find((a) => a.id === activeAccountId) || accounts[0];
  const totalCents = accounts.reduce((sum, a) => sum + Number(a.balanceCents), 0);
  const user = getUser();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "28px 20px 110px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/brand/logo-mark.svg" alt="" width={40} height={40} style={{ borderRadius: 12 }} />
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>Good to see you</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600 }}>
              {fullName ? `Welcome, ${fullName}` : "Welcome back"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <NotificationBell />
        </div>
      </header>

      {loading && <SkeletonState />}

      {!loading && error && (
        <GlassPanel style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ color: "var(--debit-500)", fontSize: 14, marginBottom: 10 }}>{error}</div>
          <button onClick={loadAccounts} style={secondaryButton}>Try again</button>
        </GlassPanel>
      )}

      {!loading && !error && accounts.length === 0 && (
        <GlassPanel style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--text-secondary)" }}>No accounts found on this profile yet.</div>
        </GlassPanel>
      )}

      {!loading && !error && accounts.length > 0 && (
        <>
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-tertiary)" }}>Total balance</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 600, letterSpacing: -0.5 }}>
              {(totalCents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, overflowX: "auto", padding: "16px 0 8px", marginBottom: 8, scrollbarWidth: "none" }}>
            {accounts.map((a) => (
              <AccountCard
                key={a.id}
                nickname={a.nickname}
                type={a.type}
                accountNumber={a.accountNumber}
                balanceCents={a.balanceCents}
                active={a.id === activeAccountId}
                onClick={() => {
                  setActiveAccountId(a.id);
                  loadTransactions(a.id);
                }}
              />
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <QuickActions onAction={handleQuickAction} />
          </div>

          {active && (
            <div style={{ marginBottom: 20 }}>
              <AccountDetails
                nickname={active.nickname}
                type={active.type}
                accountNumber={active.accountNumber}
                routingCode={active.routingCode}
              />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <SpendingChart transactions={transactions} />
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 12px 4px" }}>
            Recent activity {active ? `· ${active.nickname || active.type}` : ""}
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

      <BottomNav active="home" onSelect={handleNavSelect} />
    </main>
  );
}

function SkeletonState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ height: 140, borderRadius: "var(--radius-panel)", background: "var(--glass-fill)" }} />
      <div style={{ height: 90, borderRadius: "var(--radius-panel)", background: "var(--glass-fill)" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ height: 64, borderRadius: "var(--radius-chip)", background: "var(--glass-fill)" }} />
      ))}
    </div>
  );
}

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
