"use client";

import { useRouter } from "next/navigation";
import { GlassPanel } from "@meridian/ui";

const SECTIONS = [
  {
    title: "1. About This Platform",
    body: `Meridian is a demonstration and educational financial technology platform. All accounts, balances, and transactions processed through Meridian are simulated for illustrative purposes and do not constitute real currency, deposits, or financial instruments. Meridian is not a chartered bank, is not insured by the Federal Deposit Insurance Corporation (FDIC) or any equivalent deposit insurance scheme, and does not hold, transmit, or safeguard actual funds on behalf of any person. By creating an account, you acknowledge and agree that your use of Meridian is for demonstration, evaluation, and educational purposes only.`,
  },
  {
    title: "2. Acceptance of Terms",
    body: `By accessing or using Meridian (the "Platform"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree to these Terms in their entirety, you must not access or use the Platform. Your continued use of the Platform following any modification to these Terms constitutes your acceptance of such modification.`,
  },
  {
    title: "3. Eligibility",
    body: `You must be at least eighteen (18) years of age and possess the legal capacity to enter into a binding agreement to create an account on the Platform. By registering, you represent and warrant that all information you provide is accurate, current, and complete, and that you will promptly update such information as necessary to maintain its accuracy.`,
  },
  {
    title: "4. Account Registration and Identity",
    body: `You are solely responsible for maintaining the confidentiality of your account credentials, including your password and transaction PIN. You agree to notify us immediately of any unauthorized use of your account or any other breach of security. Meridian reserves the right to suspend or terminate any account it reasonably believes to be associated with fraudulent, misleading, or unauthorized activity.`,
  },
  {
    title: "5. Account Types and Services",
    body: `The Platform may offer multiple account types, including Checking and Savings accounts, each with distinct simulated features. Meridian reserves the right to modify, suspend, or discontinue any account type or feature at any time, with or without notice, at its sole discretion.`,
  },
  {
    title: "6. Transfers and Transaction Authorization",
    body: `All transfers initiated through the Platform require authentication via your account password and a separate transaction PIN. You agree that any transfer authorized using your correct credentials shall be deemed authorized by you, and Meridian shall bear no liability for transfers completed in accordance with correctly supplied credentials. You are responsible for verifying the accuracy of recipient account details prior to confirming any transfer, as completed transfers may not be reversible.`,
  },
  {
    title: "7. Fees and Charges",
    body: `As a demonstration platform, Meridian does not currently impose fees on any simulated account activity. Meridian reserves the right to introduce, modify, or remove any fee structure at its sole discretion, with reasonable notice provided through the Platform's notification system.`,
  },
  {
    title: "8. Privacy and Data Protection",
    body: `Meridian collects and processes personal information solely for the purposes of operating and improving the Platform. We do not sell personal information to third parties. Information you provide, including your name, date of birth, contact details, and gender, is used exclusively to facilitate account functionality and is stored using industry-standard security practices, including password and PIN hashing.`,
  },
  {
    title: "9. Account Security",
    body: `You agree to use a strong, unique password and to safeguard your transaction PIN. Meridian employs reasonable technical and organizational measures to protect your information, including encrypted credential storage and PIN-gated transaction authorization. Nonetheless, no system is entirely secure, and you accept the inherent risks of electronic financial services.`,
  },
  {
    title: "10. Suspension and Termination",
    body: `Meridian reserves the right to suspend, freeze, or terminate any account at its sole discretion, including in cases of suspected fraud, violation of these Terms, or at the request of the account holder. Any such action, including account freezes, will be logged and communicated to the affected account holder through the Platform's notification system where practicable.`,
  },
  {
    title: "11. Limitation of Liability",
    body: `To the fullest extent permitted by applicable law, Meridian and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of, or inability to use, the Platform, even if advised of the possibility of such damages. As Meridian is a simulated platform, no claim may be made for loss of real, non-simulated funds.`,
  },
  {
    title: "12. Indemnification",
    body: `You agree to indemnify and hold harmless Meridian, its operators, and affiliates from any claims, damages, liabilities, costs, or expenses arising out of your use of the Platform, your violation of these Terms, or your violation of any rights of a third party.`,
  },
  {
    title: "13. Dispute Resolution",
    body: `Any dispute arising out of or relating to these Terms or your use of the Platform shall first be addressed through good-faith negotiation. Should such efforts fail to resolve the dispute within thirty (30) days, the parties agree to submit to binding arbitration in accordance with applicable arbitration rules, in lieu of proceeding in court, except where prohibited by law.`,
  },
  {
    title: "14. Amendments",
    body: `Meridian reserves the right to amend these Terms at any time. Material changes will be communicated through the Platform's notification system. Your continued use of the Platform after such changes take effect constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "15. Governing Law",
    body: `These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction in which Meridian's operating entity is established, without regard to its conflict of law principles.`,
  },
  {
    title: "16. Severability",
    body: `If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.`,
  },
  {
    title: "17. Contact",
    body: `For questions regarding these Terms, please reach out through the support channels made available within the Platform.`,
  },
];

export default function TermsPage() {
  const router = useRouter();

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={backButton}>←</button>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, margin: 0 }}>Terms & Conditions</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 24, marginLeft: 48 }}>
        Last updated August 2026
      </p>

      <GlassPanel raised style={{ padding: "24px 24px 8px" }}>
        {SECTIONS.map((s, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>
              {s.title}
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-secondary)", margin: 0 }}>
              {s.body}
            </p>
          </div>
        ))}
      </GlassPanel>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button onClick={() => router.push("/")} style={primaryButton}>Back to dashboard</button>
      </div>
    </main>
  );
}

const backButton: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 10, border: "1px solid var(--glass-border)",
  background: "var(--glass-fill)", color: "var(--text-primary)", fontSize: 16, cursor: "pointer",
};
const primaryButton: React.CSSProperties = {
  padding: "13px 28px", borderRadius: 14, border: "none", background: "var(--signal-500)",
  color: "white", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, cursor: "pointer",
};
