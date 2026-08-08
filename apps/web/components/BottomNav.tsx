"use client";

const TABS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "transfers", label: "Transfers", icon: TransferIcon },
  { key: "cards", label: "Cards", icon: CardIcon },
  { key: "profile", label: "Profile", icon: ProfileIcon },
];

export function BottomNav({ active = "home", onSelect }: { active?: string; onSelect?: (key: string) => void }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(10,13,18,0.85)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        borderTop: "1px solid var(--glass-border)",
        zIndex: 50,
      }}
    >
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onSelect?.(key)}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 14px",
              color: isActive ? "var(--signal-400)" : "var(--text-tertiary)",
            }}
          >
            <Icon active={isActive} />
            <span style={{ fontSize: 10, fontFamily: "var(--font-body)", fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function iconProps(active?: boolean) {
  return {
    stroke: active ? "var(--signal-400)" : "var(--text-tertiary)",
    strokeWidth: 1.8,
    fill: "none",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function HomeIcon({ active }: { active?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps(active)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
}
function TransferIcon({ active }: { active?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps(active)}><path d="M7 7h13l-4-4M17 17H4l4 4" /></svg>;
}
function CardIcon({ active }: { active?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps(active)}><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>;
}
function ProfileIcon({ active }: { active?: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" {...iconProps(active)}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0116 0v1" /></svg>;
}
