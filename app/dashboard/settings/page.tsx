import { getCurrentUser } from "@/lib/auth/session";
import { UserSettingsView } from "@/components/portal/UserSettingsView";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Account Settings & Security",
  description: "Manage your trading profile, password, two-factor authentication, and execution preferences.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard%2Fsettings");
  return <UserSettingsView initialUser={user as any} defaultTab={resolvedSearchParams?.tab || "profile"} />;
}
