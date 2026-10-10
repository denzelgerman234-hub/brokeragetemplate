import { NextResponse } from "next/server";
import { translations, LANGUAGE_NAMES } from "@/lib/translations/data";

export { translations, LANGUAGE_NAMES };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? "en";
  const safeLocale = locale in translations ? locale : "en";

  return NextResponse.json({
    locale: safeLocale,
    translations: translations[safeLocale],
    languageNames: LANGUAGE_NAMES,
  });
}
