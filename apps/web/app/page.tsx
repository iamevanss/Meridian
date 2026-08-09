"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";
import { getToken, api } from "../../lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<string, string> = {
  WELCOME: "★",
  TRANSFER_SENT: "↑",
  TRANSFER_RECEIVED: "↓",
  ACCOUNT_FROZEN: "⚠",
  ACCOUNT_UNFROZEN: "✓",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      const { notifications } = await api.getNotifications();
      setNotifications(notifications);
    } catch (err: any) {
      setError(err.message || "Couldn't load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTap(n: Notification) {
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      try {
        await api.markNotificationRead(n.id);
      } catch {
        // non-fatal — worst case it shows unread again on next load
      }
    }
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch {}
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <main style={{ maxWidth: 520, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/")} style={backButton}>←</button>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Notifications</h1>
        </div>
        {hasUnread && (
          <button onClick={handleMarkAllRead} style={{ all: "unset", cursor: "pointer", fontSize: 13, color: "var(--signal-400)" }}>
            Mark all read
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ height: 70, borderRadius: "var(--radius-chip)", background: "var(--glass-fill)" }} />)}
        </div>
      )}

      {!loading && error && (
        <GlassPanel style={{ padding: 20 }}>
          <div style={{ color: "var(--debit-500)", fontSize: 14, marginBottom: 10 }}>{error}</div>
          <button onClick={load} style={secondaryButton}>Try again</button>
        </GlassPanel>
      )}

      {!loading && !error && notifications.length === 0 && (
        <GlassPanel style={{ padding: 24, textAlign: "center" }}>
          <div style={{ color: "var(--text-tertiary)", fontSize: 14 }}>You're all caught up — no notifications yet.</div>
        </GlassPanel>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n) => (
            <div key={n.id} onClick={() => handleTap(n)} style={{ cursor: "pointer" }}>
              <GlassPanel
                style={{
                  padding: 16,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  border: n.read ? "1px solid var(--glass-border)" : "1px solid var(--signal-400)",
                  background: n.read ? "var(--glass-fill)" : "rgba(62,123,250,0.08)",
                }}
              >
                <div style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{ICONS[n.type] || "•"}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                    {!n.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--signal-400)", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                  {n.actionUrl && n.actionLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(n.actionUrl!);
                      }}
                      style={actionButton}
                    >
                      ▶ {n.actionLabel}
                    </button>
                  )}
                </div>
              </GlassPanel>
            </div>
          ))}
        </div>
      )}
    </main>
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
const actionButton: React.CSSProperties = {
  marginTop: 10, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--signal-400)",
  background: "rgba(62,123,250,0.12)", color: "var(--signal-400)", fontFamily: "var(--font-body)",
  fontWeight: 600, fontSize: 13, cursor: "pointer",
};
