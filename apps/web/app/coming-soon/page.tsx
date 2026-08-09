"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { GlassPanel } from "@meridian/ui";

function ComingSoonContent() {
  const router = useRouter();
  const params = useSearchParams();
  const feature = params.get("feature") || "This feature";

  return (
    <main style={{ maxWidth: 420, margin: "0 auto", padding: "80px 20px" }}>
      <GlassPanel raised style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, margin: "0 0 8px" }}>
          {feature} is coming soon
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: "0 0 24px" }}>
          We're still building this. Check back later.
        </p>
        <button onClick={() => router.push("/")} style={primaryButton}>Back to dashboard</button>
      </GlassPanel>
    </main>
  );
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={null}>
      <ComingSoonContent />
    </Suspense>
  );
}

const primaryButton: React.CSSProperties = {
  padding: "12px 28px", borderRadius: 14, border: "none", background: "var(--signal-500)",
  color: "white", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, cursor: "pointer",
};
