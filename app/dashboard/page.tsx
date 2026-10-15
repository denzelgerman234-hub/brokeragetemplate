import { getCurrentUser } from "@/lib/auth/session";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Trading Dashboard & Cockpit",
  description: "Manage multi-asset positions, equity, margin, automated copy trading, and yield vaults.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const brand = getBrandConfig();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard");
  return <UserDashboard user={user} brand={brand} />;
}
