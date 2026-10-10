import { MarketChart } from "@/components/markets/MarketChart";
import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { LinkButton } from "@/components/ui/Button";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

type TradePageProps = {
  searchParams: {
    symbol?: string;
  };
};

export default async function TradePage({ searchParams }: TradePageProps) {
  const brand = getBrandConfig();
  const provider = getMarketDataProvider();
  const quotes = await provider.getQuotes(brand.instruments);
  const selected = quotes.find((quote) => quote.symbol === searchParams.symbol) ?? quotes[0];
  const histories = {
    "1D": await provider.getHistory(selected.symbol, "1D"),
    "1W": await provider.getHistory(selected.symbol, "1W"),
    "1M": await provider.getHistory(selected.symbol, "1M"),
    "1Y": await provider.getHistory(selected.symbol, "1Y"),
  };

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Trade</p>
          <h1 className="font-heading text-5xl font-semibold">Trade {selected.symbol}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">Review the selected market, compare recent movement, and continue into a secure account to place orders.</p>
          <div className="mt-8">
            <MarketChart symbol={selected.symbol} currency={brand.currencyDefault} histories={histories} />
          </div>
        </div>
        <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
          <div className="rounded-brand bg-brand-background/45 p-5">
            <h2 className="font-heading text-2xl font-semibold">Demo order preview</h2>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">Create an account to access the order ticket, manage positions, and review account activity.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <LinkButton href="/auth/register">Create account</LinkButton>
              <LinkButton href="/auth/login" variant="secondary">Sign in</LinkButton>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <LiveMarketTable quotes={quotes} currency={brand.currencyDefault} pageSize={6} />
      </section>
    </main>
  );
}
