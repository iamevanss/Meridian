import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  raised?: boolean;
  children: React.ReactNode;
}

/**
 * The base "Liquid Glass" surface used across the app: a translucent,
 * blurred panel with a soft top-edge specular highlight, echoing iOS 26's
 * glass material. Every card, sheet, and modal in the product composes
 * from this primitive so the material feels consistent everywhere.
 */
export function GlassPanel({ raised = false, children, style, ...props }: GlassPanelProps) {
  return (
    <div
      {...props}
      style={{
        position: "relative",
        borderRadius: "var(--radius-panel)",
        background: raised ? "var(--glass-fill-raised)" : "var(--glass-fill)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(var(--blur-panel)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--blur-panel)) saturate(160%)",
        boxShadow: "0 1px 0 0 var(--glass-highlight) inset, 0 20px 60px -20px rgba(0,0,0,0.6)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
