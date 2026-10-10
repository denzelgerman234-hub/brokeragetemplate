import { CoinGeckoMarketDataProvider } from "@/lib/market-data/coingecko";
import { MockMarketDataProvider } from "@/lib/market-data/mock";
import type { MarketDataProvider } from "@/lib/market-data/types";

export function getMarketDataProvider(): MarketDataProvider {
  if (process.env.MARKET_DATA_PROVIDER !== "mock") {
    return new CoinGeckoMarketDataProvider();
  }

  return new MockMarketDataProvider();
}
