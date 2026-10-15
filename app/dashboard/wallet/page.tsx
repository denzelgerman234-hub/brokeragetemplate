import { redirect } from "next/navigation";

export const metadata = {
  title: "Wallet & Capital Transfers",
  description: "Deposit cryptocurrency, request wire withdrawals, and manage internal sub-account balances.",
};

export default function WalletPage() {
  redirect("/dashboard/portfolio?tab=funding");
}
