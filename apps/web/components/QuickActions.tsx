"use client";

import { GlassPanel } from "@meridian/ui";

const ACTIONS = [
  { key: "send", label: "Send", icon: SendIcon },
  { key: "request", label: "Request", icon: RequestIcon },
  { key: "pay", label: "Pay bills", icon: PayIcon },
  { key: "cards", label: "Cards", icon: CardsIcon },
];

export function QuickActions({ onAction }: { onAction?: (key: string) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {ACTIONS.map(({ key, label, icon: Icon }) => (
        <button key={key} onClick={() => onAction?.(key)} style={{ all: "unset", cursor: "pointer" }}>
          <GlassPanel style={{ padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Icon />
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>{label}</span>
          </GlassPanel>
        </button>
      ))}
    </div>
  );
}

const strokeProps = { stroke: "var(--signal-400)", strokeWidth: 1.8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function SendIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
}
function RequestIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps}><path d="M12 5v14M19 12l-7 7-7-7" /></svg>;
}
function PayIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M7 15h4" /></svg>;
}
function CardsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" {...strokeProps}><rect x="3" y="5" width="15" height="11" rx="2" /><rect x="6" y="8" width="15" height="11" rx="2" fill="var(--ink-900)" /></svg>;
}
