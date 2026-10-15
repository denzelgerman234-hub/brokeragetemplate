import { MarketChart } from "@/components/markets/MarketChart";
import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { LinkButton } from "@/components/ui/Button";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";
import { getCurrentUser } from "@/lib/auth/session";
import { TradeOrderTicket } from "@/components/markets/TradeOrderTicket";

type TradePageProps = {
  searchParams: Promise<{
    symbol?: string;
  }>;
};

export default async function TradePage({ searchParams }: TradePageProps) {
  const { symbol } = await searchParams;
  const brand = getBrandConfig();
  const provider = getMarketDataProvider();
  const quotes = await provider.getQuotes(brand.instruments);
  const selected = quotes.find((quote) => quote.symbol === symbol) ?? quotes[0];
  const histories = {
    "1D": await provider.getHistory(selected.symbol, "1D"),
    "1W": await provider.getHistory(selected.symbol, "1W"),
    "1M": await provider.getHistory(selected.symbol, "1M"),
    "1Y": await provider.getHistory(selected.symbol, "1Y"),
  };

  const user = await getCurrentUser();
  const activeUser = user || {
    id: "cmv1uievr0006kblrots79t8e",
    firstName: "Solomon",
    lastName: "Adams",
    email: "adamssolomon838@gmail.com",
    role: "USER",
    status: "ACTIVE",
  };

  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-primary">Trade Desk</p>
          <h1 className="font-heading text-5xl font-semibold">Trade {selected.symbol}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-secondary">
            Review the selected market, analyse price action, and place orders directly from your live account.
          </p>
          <div className="mt-8">
            <MarketChart symbol={selected.symbol} currency={brand.currencyDefault} histories={histories} />
          </div>
        </div>

        <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
          <TradeOrderTicket
            user={activeUser}
            instrument={selected}
            currency={brand.currencyDefault}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <LiveMarketTable quotes={quotes} currency={brand.currencyDefault} pageSize={6} />
      </section>
    </main>
  );
}
