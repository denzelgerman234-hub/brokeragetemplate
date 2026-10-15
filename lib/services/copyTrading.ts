"use client";
import { useCallback, useEffect, useState } from "react";

export type CopySubscription = { id: string; providerId: string; providerName: string; providerHandle: string; allocatedAmount: number; maxDrawdown: number; status: "ACTIVE" | "PAUSED" | "REVOKED"; startedAt: string };
export function useCopyTrading() {
  const [subscriptions, setSubscriptions] = useState<CopySubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => { try { const response = await fetch("/api/copy-trading", { cache: "no-store" }); if (response.ok) setSubscriptions(await response.json()); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void refresh(); const listener = () => void refresh(); window.addEventListener("pb-copy-trading-changed", listener); return () => window.removeEventListener("pb-copy-trading-changed", listener); }, [refresh]);
  const copyProvider = useCallback(async (provider: { id: string; name: string; handle: string }, amount: number, maxDrawdown = 15) => { const response = await fetch("/api/copy-trading", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ providerId: provider.id, providerName: provider.name, providerHandle: provider.handle, amount, maxDrawdown }) }); if (!response.ok) throw new Error("Unable to start mirroring"); await refresh(); window.dispatchEvent(new Event("pb-copy-trading-changed")); }, [refresh]);
  const update = useCallback(async (id: string, status: "ACTIVE" | "PAUSED") => { await fetch("/api/copy-trading", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) }); await refresh(); window.dispatchEvent(new Event("pb-copy-trading-changed")); }, [refresh]);
  const revokeSubscription = useCallback(async (id: string) => { await fetch(`/api/copy-trading?id=${encodeURIComponent(id)}`, { method: "DELETE" }); await refresh(); window.dispatchEvent(new Event("pb-copy-trading-changed")); }, [refresh]);
  return { subscriptions, isLoading, refresh, copyProvider, pauseSubscription: (id: string) => update(id, "PAUSED"), resumeSubscription: (id: string) => update(id, "ACTIVE"), revokeSubscription, isCopied: (providerId: string) => subscriptions.some((s) => s.providerId === providerId && s.status !== "REVOKED") };
}
