import { KycPreviewForm } from "@/components/kyc/KycPreviewForm";
import { SupportPanel } from "@/components/support/SupportPanel";
import { getCurrentUser } from "@/lib/auth/session";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const brand = getBrandConfig();

  return (
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Dashboard</p>
      <h1 className="font-heading text-5xl font-semibold">Welcome, {user.firstName || "Trader"}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">Verify your identity, manage account support, and prepare your profile for trading access.</p>
      <section className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h2 className="mb-4 font-heading text-2xl font-semibold">Account verification</h2>
          <KycPreviewForm kyc={brand.kyc} />
        </div>
        <div>
          <h2 className="mb-4 font-heading text-2xl font-semibold">Support</h2>
          <SupportPanel />
        </div>
      </section>
    </main>
  );
}
