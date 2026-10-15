import { prisma } from "@/lib/db";

export async function accountSnapshot(userId: string) {
  const [accounts, positions] = await Promise.all([prisma.account.findMany({ where: { userId } }), prisma.position.findMany({ where: { userId, status: "OPEN" } })]);
  return accounts.map((account: any) => { const unrealized = positions.reduce((total: number, position: any) => total + position.pnl, 0); const equity = account.balance + (account.type === "LIVE" ? unrealized : 0); return { ...account, equity, unrealizedPnl: account.type === "LIVE" ? unrealized : 0, freeMargin: Math.max(0, equity - account.marginUsed), marginLevel: account.marginUsed ? (equity / account.marginUsed) * 100 : null }; });
}

export function tradePnl(side: string, size: number, entry: number, mark: number) { return (side === "BUY" ? mark - entry : entry - mark) * size; }
export function estimatedFee(notional: number, discount = 0) { return Math.max(0, notional * 0.001 * (1 - discount / 100)); }
