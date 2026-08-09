"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.getNotifications()
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => {});
  }, []);

  return (
    <button onClick={() => router.push("/notifications")} style={{ all: "unset", cursor: "pointer", position: "relative", padding: 6 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute", top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8,
            background: "var(--debit-500)", color: "white", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
          }}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
