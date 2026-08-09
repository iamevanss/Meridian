"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel, LedgerRow } from "@meridian/ui";
import { getToken, api } from "../../lib/api";

interface Account {
  id: string;
  nickname: string | null;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
}

interface Transaction {
  id: string;
  type: "DEBIT" | "CREDIT";
  description: string;
  memo?: string;
  amountCents: string;
  createdAt: string;
  accountId: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>("ALL"); // "ALL" or an accountId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    load();
  }, [router]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { accounts } = await api.getAccounts();
      setAccounts(accounts);

      const all = await Promise.all(
        accounts.map((a: Account) =>
          api.getTransactions(a.id).then((r) => r.transactions.map((t: any) => ({ ...t, accountId: a.id })))
        )
      );
      const merged = all.flat().sort((a: Transaction, b: Transaction) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(merged);
    } catch (err: any) {
      setError(err.message || "Couldn't load your activity.");
    } finally {
      setLoading(false);
    }
  }

  const visible = filter === "ALL" ? transactions : transactions.filter((t) => t.accountId === filter);

  // Group by date label
  const groups: { label: string; items: Transaction[] }[] = [];
  for (const tx of visible) {
    const label = new Date(tx.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const group = groups.find((g) => g.label === label);
    if (group) group.items.push(tx);
    else groups.push({ label, items: [tx] });
  }

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "48px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/")} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Activity</h1>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20 }}>
        <FilterChip label="All" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
        {accounts.map((a) => (
          <FilterChip key={a.id} label={a.nickname || a.type} active={filter === a.id} onClick={() => setFilter(a.id)} />
        ))}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 64, borderRadius: "var(--radius-chip)", background: "var(--glass-fill)" }} />)}
        </div>
      )}

      {!loading && error && (
        <GlassPanel style={{ padding: 20 }}>
          <div style={{ color: "var(--debit-500)", fontSize: 14, marginBottom: 10 }}>{error}</div>
          <button onClick={load} style={secondaryButton}>Try again</button>
        </GlassPanel>
      )}

      {!loading && !error && visible.length === 0 && (
        <GlassPanel style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No transactions to show.</div>
        </GlassPanel>
      )}

      {!loading && !error && groups.map((group) => (
        <div key={group.label} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", margin: "0 0 8px 4px" }}>{group.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {group.items.map((tx, i) => (
              <LedgerRow key={tx.id} index={i} type={tx.type} description={tx.description} memo={tx.memo} amountCents={tx.amountCents} date={tx.createdAt} />
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
        border: active ? "1px solid var(--signal-400)" : "1px solid var(--glass-border)",
        background: active ? "rgba(62,123,250,0.15)" : "var(--glass-fill)",
        color: active ? "var(--signal-400)" : "var(--text-secondary)",
      }}
    >
      {label}
    </button>
  );
}

const backButton: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontSize: 16, cursor: "pointer",
};
const secondaryButton: React.CSSProperties = {
  padding: "10px 16px", borderRadius: 12, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
};
