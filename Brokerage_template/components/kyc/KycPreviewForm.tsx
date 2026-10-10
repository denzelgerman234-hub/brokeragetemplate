"use client";

import { useMemo, useState } from "react";
import type { BrandConfig } from "@/config/brand.schema";

type KycPreviewFormProps = {
  kyc: BrandConfig["kyc"];
};

export function KycPreviewForm({ kyc }: KycPreviewFormProps) {
  const countries = Object.entries(kyc.countryIdRequirements);
  const [country, setCountry] = useState(countries[0]?.[0] ?? "default");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const requirement = useMemo(() => kyc.countryIdRequirements[country] ?? kyc.defaultRequirement, [country, kyc]);

  async function submit(formData: FormData) {
    setStatus("loading");
    setError("");
    formData.set("country", country);
    const response = await fetch("/api/kyc", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
    if (!response.ok) {
      setStatus("error");
      setError(data?.errors ? Object.values(data.errors).flat()[0] ?? "Unable to submit verification." : "Unable to submit verification.");
      return;
    }
    setStatus("success");
  }

  return (
    <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <form action={submit} className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
        <label className="grid gap-2 text-sm font-medium">
          Country
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm">
            {countries.map(([code, item]) => (
              <option key={code} value={code}>
                {item.label}
              </option>
            ))}
            <option value="default">{kyc.defaultRequirement.label}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          {requirement.idNumberLabel}
          <input name="idNumber" required className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" placeholder={requirement.idNumberLabel} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Identity document
          <select name="documentType" className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm">
            {requirement.acceptedDocuments.map((document) => (
              <option key={document}>{document}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Upload document
          <input name="document" required type="file" accept="image/*,.pdf" className="rounded-brand border border-white/10 bg-brand-surface px-4 py-3 text-sm" />
        </label>
        {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
        {status === "success" ? <p className="text-sm text-brand-success">Verification submitted for review.</p> : null}
        <button disabled={status === "loading"} type="submit" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-50">
          {status === "loading" ? "Submitting..." : "Submit verification"}
        </button>
      </form>
    </div>
  );
}
