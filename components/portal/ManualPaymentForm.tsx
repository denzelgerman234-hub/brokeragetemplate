"use client";

import { FormEvent, useEffect, useState } from "react";
import { CurrencyDisclosure } from "@/components/currency/CurrencyDisclosure";
import { useCurrency } from "@/context/CurrencyContext";
import { Copy, CheckCheck } from "lucide-react";

const methods = ["Bank transfer", "Crypto transfer", "Gift card", "Debit / credit card"];

type DepositDetails = {
  btcAddress?: string;
  ethAddress?: string;
  usdtTrc20Address?: string;
  usdtErc20Address?: string;
  solAddress?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftBic?: string;
  routingNumber?: string;
  wireInstructions?: string;
  media?: Record<string, { name: string; url: string }>;
};

const cryptoOptions = [
  { key: "btcAddress", label: "Bitcoin (BTC)" },
  { key: "ethAddress", label: "Ethereum (ETH)" },
  { key: "usdtTrc20Address", label: "USDT TRC-20" },
  { key: "usdtErc20Address", label: "USDT ERC-20" },
  { key: "solAddress", label: "Solana (SOL)" },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button type="button" onClick={copy} title="Copy" className="ml-2 shrink-0 rounded-lg p-1.5 text-brand-secondary transition hover:bg-white/10 hover:text-white">
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function DepositInstructions({ details, method }: { details: DepositDetails; method: string }) {
  if (method === "Crypto transfer") {
    const available = cryptoOptions.filter(({ key }) => details[key]);
    if (!available.length) {
      return <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-brand-secondary">No crypto addresses have been configured yet. Please contact support.</p>;
    }
    return (
      <div className="mt-4 space-y-3">
        {available.map(({ key, label }) => {
          const address = details[key] as string;
          const qr = details.media?.[key];
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-secondary">{label}</p>
              <div className="flex items-center gap-1">
                <span className="break-all font-mono text-sm text-white">{address}</span>
                <CopyButton text={address} />
              </div>
              {qr && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr.url} alt={`${label} QR code`} className="h-32 w-32 rounded-lg border border-white/10 object-contain" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (method === "Bank transfer") {
    const bankRows: { label: string; value: string }[] = [
      { label: "Bank name", value: details.bankName ?? "" },
      { label: "Beneficiary name", value: details.accountName ?? "" },
      { label: "Account / IBAN", value: details.accountNumber ?? "" },
      { label: "SWIFT / BIC", value: details.swiftBic ?? "" },
      { label: "Routing number", value: details.routingNumber ?? "" },
    ].filter((row) => row.value);
    const hasAny = bankRows.length > 0 || details.wireInstructions;
    if (!hasAny) {
      return <p className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-brand-secondary">No bank wire details have been configured yet. Please contact support.</p>;
    }
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
        {bankRows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-2">
            <span className="text-xs text-brand-secondary shrink-0 w-36">{label}</span>
            <div className="flex flex-1 items-center justify-end gap-1">
              <span className="font-mono text-sm text-white text-right break-all">{value}</span>
              <CopyButton text={value} />
            </div>
          </div>
        ))}
        {details.wireInstructions && (
          <div>
            <p className="text-xs text-brand-secondary">Wire instructions</p>
            <p className="mt-1 text-sm text-white whitespace-pre-line">{details.wireInstructions}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function ManualPaymentForm({ kind, amount, planId, onSubmitted }: { kind: "DEPOSIT" | "PLAN"; amount?: number; planId?: string; onSubmitted?: () => void }) {
  const { currency, formatMoney } = useCurrency();
  const [method, setMethod] = useState(methods[0]);
  const [value, setValue] = useState(amount?.toString() ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState<DepositDetails | null>(null);

  useEffect(() => {
    fetch("/api/payments/deposit-details", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DepositDetails | null) => { if (data) setDetails(data); })
      .catch(() => null);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    data.set("kind", kind);
    data.set("method", method);
    data.set("amount", value);
    if (planId) data.set("planId", planId);
    const response = await fetch("/api/payment-requests", { method: "POST", body: data });
    setBusy(false);
    if (response.ok) {
      setMessage(kind === "DEPOSIT" ? "Deposit submitted. Your account will update once processing is complete." : "Payment submitted. Your plan benefits will activate once processing is complete.");
      onSubmitted?.();
    } else {
      setMessage("We couldn't submit that payment. Please check your details and try again.");
    }
  }

  const numericValue = Number(value);
  const showInstructions = method === "Bank transfer" || method === "Crypto transfer";

  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
      {/* Method tabs */}
      <div className="flex flex-wrap gap-2">
        {methods.map((item) => (
          <button key={item} type="button" onClick={() => setMethod(item)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${method === item ? "bg-brand-primary text-black" : "bg-white/5 text-brand-secondary hover:bg-white/10"}`}>
            {item}
          </button>
        ))}
      </div>

      {/* Payment instructions */}
      {showInstructions && details && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
            {method === "Crypto transfer" ? "Send to these wallet addresses" : "Wire to this account"}
          </p>
          <DepositInstructions details={details} method={method} />
        </div>
      )}

      {/* Submission form */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-secondary">Confirm your payment</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-brand-secondary">
            Amount (USD)
            <input value={value} onChange={(event) => setValue(event.target.value)} readOnly={Boolean(amount)} required type="number" min="1" name="amount"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
            {currency !== "USD" && Number.isFinite(numericValue)
              ? <span className="mt-1 block text-brand-secondary">≈ {formatMoney(numericValue)}</span>
              : null}
          </label>
          <label className="text-xs text-brand-secondary">
            Payment reference
            <input name="reference" placeholder="Transfer / receipt reference" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" />
          </label>
        </div>
        <CurrencyDisclosure />
        <label className="mt-3 block text-xs text-brand-secondary">
          Receipt or proof (optional)
          <input name="proof" type="file" accept="image/*,.pdf" className="mt-1 block w-full text-xs" />
        </label>
        <p className="mt-3 text-xs text-brand-secondary">For your security, do not upload card numbers, CVV codes, or banking passwords.</p>
        {message && <p className="mt-3 text-sm text-brand-primary">{message}</p>}
        <button disabled={busy} className="mt-4 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">
          {busy ? "Submitting…" : "Submit payment"}
        </button>
      </div>
    </form>
  );
}