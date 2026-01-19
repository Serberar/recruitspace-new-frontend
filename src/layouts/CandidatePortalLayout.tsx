import type { ReactNode } from "react";
import { CandidateMenu } from "../components/candidateMenu";
import { AppFooter } from "../components/footer/AppFooter";

interface CandidatePortalLayoutProps {
  children: ReactNode;
}

export default function CandidatePortalLayout({ children }: CandidatePortalLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <CandidateMenu />
      <main style={{
        flex: 1,
        padding: "var(--spacing-xl)",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%"
      }}>
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
