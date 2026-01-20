import type { ReactNode } from "react";
import Menu from "../components/menu/Menu";
import { AppFooter } from "../components/footer/AppFooter";
import { BetaBanner } from "../components/banners/BetaBanner";
import { SmtpAlertBanner } from "../components/banners/SmtpAlertBanner";
import styles from "./DashboardLayout.module.css";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <Menu />
      <div className={styles.contentWrapper}>
        {/* Banners de avisos */}
        <BetaBanner />
        <SmtpAlertBanner />
        <main className={styles.main}>
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}
