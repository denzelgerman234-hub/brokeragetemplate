import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Trading Dashboard & Cockpit",
  description: "Manage multi-asset positions, equity, margin, automated copy trading, and yield vaults.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") redirect("/auth/login?redirect=%2Fdashboard");
  // The legacy overview contains sample balances and positions. Send signed-in
  // clients to the database-backed portfolio rather than presenting samples as
  // their live account data.
  redirect("/dashboard/portfolio");
}
