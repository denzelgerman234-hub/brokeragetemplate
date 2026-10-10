import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { DepositActivityToast } from "@/components/layout/DepositActivityToast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-background text-brand-text">
      <Header />
      {children}
      <Footer />
      <CookieConsent />
      <DepositActivityToast />
    </div>
  );
}
