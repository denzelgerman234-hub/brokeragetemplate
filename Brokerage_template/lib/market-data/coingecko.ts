import type { BrandConfig } from "@/config/brand.schema";
import type { MarketDataProvider, MarketPoint, MarketQuote } from "@/lib/market-data/types";
import { MockMarketDataProvider } from "@/lib/market-data/mock";

const coingeckoIds: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
};

export class CoinGeckoMarketDataProvider implements MarketDataProvider {
  private fallback = new MockMarketDataProvider();

  async getQuotes(instruments: BrandConfig["instruments"]): Promise<MarketQuote[]> {
    const crypto = instruments.filter((instrument) => instrument.category === "crypto" && coingeckoIds[instrument.symbol]);
    const others = instruments.filter((instrument) => !crypto.includes(instrument));

    try {
      const ids = crypto.map((instrument) => coingeckoIds[instrument.symbol]).join(",");
      if (!ids) return this.fallback.getQuotes(instruments);
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`, {
        next: { revalidate: 30 },
      });
      if (!response.ok) throw new Error("CoinGecko request failed");
      const data = (await response.json()) as Record<string, { usd: number; usd_24h_change: number; usd_24h_vol: number }>;
      const fallbackQuotes = await this.fallback.getQuotes(instruments);

      return instruments.map((instrument) => {
        const id = coingeckoIds[instrument.symbol];
        const live = id ? data[id] : undefined;
        if (!live) return fallbackQuotes.find((quote) => quote.symbol === instrument.symbol)!;

        const sparkline = fallbackQuotes.find((quote) => quote.symbol === instrument.symbol)!.sparkline;
        return {
          symbol: instrument.symbol,
          name: instrument.name,
          category: instrument.category,
          price: live.usd,
          change24h: live.usd_24h_change,
          high24h: Math.max(...sparkline, live.usd),
          low24h: Math.min(...sparkline, live.usd),
          volume: live.usd_24h_vol,
          sparkline,
          source: "live",
          updatedAt: new Date().toISOString(),
        };
      });
    } catch {
      return this.fallback.getQuotes([...crypto, ...others]);
    }
  }

  async getHistory(symbol: string, timeframe: string): Promise<MarketPoint[]> {
    const id = coingeckoIds[symbol];
    if (!id) return this.fallback.getHistory(symbol, timeframe);

    const daysByTimeframe: Record<string, string> = {
      "1D": "1",
      "1W": "7",
      "1M": "30",
      "1Y": "365",
    };

    try {
      const days = daysByTimeframe[timeframe] ?? "1";
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`, {
        next: { revalidate: timeframe === "1D" ? 60 : 300 },
      });
      if (!response.ok) throw new Error("CoinGecko history request failed");
      const data = (await response.json()) as { prices?: [number, number][] };
      const prices = data.prices ?? [];
      if (!prices.length) throw new Error("CoinGecko history returned no prices");

      return prices.map(([time, price]) => ({
        time: new Date(time).toISOString(),
        price,
      }));
    } catch {
      return this.fallback.getHistory(symbol, timeframe);
    }
  }
}
