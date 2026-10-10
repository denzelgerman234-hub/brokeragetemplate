"use client";

import { useEffect, useState } from "react";
import { MarketTable } from "@/components/markets/MarketTable";
import type { MarketQuote } from "@/lib/market-data/types";

type LiveMarketTableProps = {
  quotes: MarketQuote[];
  currency: string;
  initialCategory?: string;
  pageSize?: number;
};

export function LiveMarketTable(props: LiveMarketTableProps) {
  const [quotes, setQuotes] = useState(props.quotes);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const response = await fetch("/api/markets/quotes", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { quotes?: MarketQuote[]; updatedAt?: string };
      if (!cancelled && data.quotes?.length) {
        setQuotes(data.quotes);
        setUpdatedAt(data.updatedAt ?? null);
      }
    }

    refresh();
    const interval = window.setInterval(refresh, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-brand-secondary">
        <span>Live crypto pricing updates automatically. Other asset classes update when a provider is connected.</span>
        {updatedAt ? <span>{new Date(updatedAt).toLocaleTimeString()}</span> : null}
      </div>
      <MarketTable {...props} quotes={quotes} />
    </div>
  );
}
