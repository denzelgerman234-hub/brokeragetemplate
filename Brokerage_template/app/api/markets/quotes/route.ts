import { NextResponse } from "next/server";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { getMarketDataProvider } from "@/lib/market-data/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const brand = getBrandConfig();
  const quotes = await getMarketDataProvider().getQuotes(brand.instruments);

  return NextResponse.json({
    quotes,
    updatedAt: new Date().toISOString(),
  });
}
