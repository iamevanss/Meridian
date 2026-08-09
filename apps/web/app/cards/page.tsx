"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { getToken, api } from "../../lib/api";

interface Account {
  id: string;
  nickname: string | null;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
}

export default function CardsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api.getAccounts().then((r) => setAccounts(r.accounts)).finally(() => setLoading(false));
  }, [router]);

  // Deterministic-looking placeholder card number/expiry derived from the real
  // account number, so it's consistent per account without inventing a whole
  // card-issuing system (out of scope for a demo bank).
  function cardNumberFor(accountNumber: string) {
    const digits = accountNumber.padStart(16, "4").slice(-16);
    return digits.match(/.{1,4}/g)!.join(" ");
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 100px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Cards</h1>
      </div>

      {loading && <div style={{ height: 200, borderRadius: "var(--radius-panel)", background: "var(--glass-fill)" }} />}

      {!loading && accounts.length === 0 && (
        <GlassPanel style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>No accounts to show cards for.</div>
        </GlassPanel>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {accounts.map((a) => {
          const isRevealed = revealed === a.id;
          const isSavings = a.type === "SAVINGS";
          return (
            <div key={a.id}>
              <div
                style={{
                  borderRadius: 24,
                  padding: 24,
                  minHeight: 180,
                  position: "relative",
                  overflow: "hidden",
                  background: isSavings
                    ? "linear-gradient(135deg, #12241c 0%, #0a0d12 60%)"
                    : "linear-gradient(135deg, #16233a 0%, #0a0d12 60%)",
                  border: "1px solid var(--glass-border)",
                  boxShadow: "0 20px 60px -20px rgba(0,0,0,0.7)",
                }}
              >
                <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: isSavings ? "rgba(53,208,127,0.10)" : "rgba(62,123,250,0.12)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <img src="/brand/logo-mark.svg" alt="" width={32} height={32} style={{ borderRadius: 9 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text-tertiary)" }}>VIRTUAL</span>
                </div>

                <div style={{ marginTop: 36, fontFamily: "var(--font-mono)", fontSize: 19, letterSpacing: 2, color: "var(--text-primary)" }}>
                  {isRevealed ? cardNumberFor(a.accountNumber) : `•••• •••• •••• ${a.accountNumber.slice(-4)}`}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>CARD TYPE</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{a.nickname || a.type}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, letterSpacing: 1, color: "var(--text-primary)", opacity: 0.85 }}>
                    MERIDIAN
                  </div>
                </div>
              </div>

              <button onClick={() => setRevealed(isRevealed ? null : a.id)} style={secondaryButton}>
                {isRevealed ? "Hide card number" : "Show card number"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}

const backButton: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontSize: 16, cursor: "pointer",
};
const secondaryButton: React.CSSProperties = {
  width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 12, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontFamily: "var(--font-body)",
  fontWeight: 600, fontSize: 13, cursor: "pointer",
};
