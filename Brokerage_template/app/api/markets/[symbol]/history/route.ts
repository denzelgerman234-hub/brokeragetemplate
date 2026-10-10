import { NextResponse } from "next/server";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export const dynamic = "force-dynamic";

type HistoryRouteProps = {
  params: {
    symbol: string;
  };
};

export async function GET(request: Request, { params }: HistoryRouteProps) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe") ?? "1D";
  const brand = getBrandConfig();
  const instrument = brand.instruments.find((item) => item.symbol.toLowerCase() === params.symbol.toLowerCase());

  if (!instrument) {
    return NextResponse.json({ error: "Market not found" }, { status: 404 });
  }

  const history = await getMarketDataProvider().getHistory(instrument.symbol, timeframe);

  return NextResponse.json({
    symbol: instrument.symbol,
    timeframe,
    history,
    updatedAt: new Date().toISOString(),
  });
}
