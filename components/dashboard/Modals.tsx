"use client";

import { useEffect, useState } from "react";
import { useDismissibleModal } from "@/components/ui/useDismissibleModal";
import { X, Copy, Check, QrCode, ArrowDownLeft, ArrowUpRight, ShieldCheck, Zap, AlertTriangle, Sparkles } from "lucide-react";
import type { StrategyProvider, StakingVault, Position } from "./types";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyDisclosure } from "@/components/currency/CurrencyDisclosure";

function ConvertedAmountPreview({ value }: { value: string }) {
  const { currency, formatMoney } = useCurrency();
  const amount = Number(value);
  if (currency === "USD" || value.trim() === "" || !Number.isFinite(amount)) return null;
  return <p className="mt-1 text-xs text-brand-secondary" aria-live="polite">≈ {formatMoney(amount)}</p>;
}

// ── 1. DEPOSIT MODAL ────────────────────────────────────────────────────────
interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, asset: string) => void;
}

export function DepositModal({ isOpen, onClose, onDepositSuccess }: DepositModalProps) {
  useDismissibleModal(isOpen, onClose);
  const { currency, formatMoney } = useCurrency();
  const [method, setMethod] = useState<"USDT" | "BTC" | "CARD" | "WIRE">("USDT");
  const [amount, setAmount] = useState("5000");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string> & { media?: Record<string, { url: string; name: string }> }>({});

  useEffect(() => {
    if (isOpen) fetch("/api/payments/deposit-details").then((response) => response.ok ? response.json() : null).then((data) => data && setPaymentDetails(data)).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const mockAddresses = {
    USDT: paymentDetails.usdtTrc20Address || "Deposit address not configured yet",
    BTC: paymentDetails.btcAddress || "Deposit address not configured yet",
  };
  const qrKey = method === "BTC" ? "btcAddress" : "usdtTrc20Address";
  const qrImage = paymentDetails.media?.[qrKey];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { setError("Please enter a valid deposit amount."); return; }
    setIsSubmitting(true);
    setError("");
    const form = new FormData();
    form.set("kind", "DEPOSIT");
    form.set("method", method);
    form.set("asset", method);
    form.set("amount", String(num));
    const response = await fetch("/api/payment-requests", { method: "POST", body: form });
    const data = await response.json().catch(() => null) as { error?: string } | null;
    setIsSubmitting(false);
    if (!response.ok) { setError(data?.error ?? "We couldn’t submit your deposit for approval."); return; }
    onDepositSuccess(num, method);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <ArrowDownLeft className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Deposit Funds</h3>
            <p className="text-xs text-brand-secondary">Instant multi-asset account funding</p>
          </div>
        </div>

        {/* Method selector tabs */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {(["USDT", "BTC", "CARD", "WIRE"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`rounded-xl border py-2 text-xs font-semibold transition-all ${
                method === m
                  ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                  : "border-white/10 bg-white/5 text-brand-secondary hover:text-white"
              }`}
            >
              {m === "CARD" ? "Card / Apple Pay" : m === "WIRE" ? "Bank Wire" : m}
            </button>
          ))}
        </div>

        {/* Dynamic method content */}
        {method === "USDT" || method === "BTC" ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-xl bg-white p-2">
                {qrImage ? <img src={qrImage.url} alt={`${method} deposit QR code`} className="h-full w-full rounded object-contain" /> : <div className="h-full w-full bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:8px_8px] rounded border border-black/20 flex items-center justify-center text-[10px] font-bold text-black uppercase">{method} QR Code</div>}
              </div>
              <p className="mt-3 text-xs text-brand-secondary">
                Network: <span className="text-white font-semibold">{method === "USDT" ? "TRC-20 (Tron)" : "Bitcoin Mainnet"}</span>
              </p>
              <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2 text-xs font-mono">
                <span className="truncate text-white/90">{mockAddresses[method]}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(mockAddresses[method])}
                  className="ml-2 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[11px] text-brand-primary hover:bg-white/20"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-brand-secondary">Deposit Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
              />
              <ConvertedAmountPreview value={amount} />
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-brand-secondary">Deposit Amount (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
              />
              <ConvertedAmountPreview value={amount} />
            </div>
            <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 text-xs text-brand-secondary space-y-2">
              {method === "WIRE" && <><div className="flex justify-between gap-4"><span>Bank:</span><span className="text-right text-white">{paymentDetails.bankName || "Not configured"}</span></div><div className="flex justify-between gap-4"><span>Beneficiary:</span><span className="text-right text-white">{paymentDetails.accountName || "Not configured"}</span></div><div className="flex justify-between gap-4"><span>Account / IBAN:</span><span className="text-right text-white">{paymentDetails.accountNumber || "Not configured"}</span></div><div className="flex justify-between gap-4"><span>SWIFT / BIC:</span><span className="text-right text-white">{paymentDetails.swiftBic || "Not configured"}</span></div></>}
              <div className="flex justify-between">
                <span>Payment Gateway:</span>
                <span className="text-white font-semibold">Tier-1 Institutional Escrow</span>
              </div>
              <div className="flex justify-between">
                <span>Processing Time:</span>
                <span className="text-emerald-400 font-semibold">{method === "CARD" ? "Instant (0-1 min)" : "Same-day SEPA / SWIFT"}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit Fee:</span>
                <span className="text-white font-semibold">0.00% (Covered by Broker)</span>
              </div>
            </div>
          </div>
        )}
        <CurrencyDisclosure />


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="w-1/2 rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : `Submit for approval (${formatMoney(Number(amount))})`}
          </button>
        </div>
        {error && (
          <div role="status" aria-live="polite" className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 2. WITHDRAW MODAL ───────────────────────────────────────────────────────
interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onWithdrawSuccess: (amount: number, asset: string, destination: string) => void;
}

export function WithdrawModal({ isOpen, onClose, availableBalance, onWithdrawSuccess }: WithdrawModalProps) {
  useDismissibleModal(isOpen, onClose);
  const { currency, formatMoney } = useCurrency();
  const [asset, setAsset] = useState("USDT");
  const [amount, setAmount] = useState("2500");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Crypto fields
  const [walletAddress, setWalletAddress] = useState("");
  const [walletNetwork, setWalletNetwork] = useState("TRC-20");

  // Bank wire fields
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [ibanAccount, setIbanAccount] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [bankNote, setBankNote] = useState("");

  if (!isOpen) return null;

  const isCrypto = asset === "BTC" || asset === "USDT";

  const handleConfirm = () => {
    setError("");
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError("Please enter a valid withdrawal amount.");
      return;
    }
    if (num > availableBalance) {
      setError(`Amount exceeds your available free margin of ${formatCurrency(availableBalance, "USD")}.`);
      return;
    }

    let destination = "";
    if (isCrypto) {
      if (!walletAddress.trim()) {
        setError("Please enter your receiving crypto wallet address.");
        return;
      }
      destination = `${asset} · ${walletNetwork} · ${walletAddress.trim()}`;
    } else {
      if (!bankName.trim() || !accountHolder.trim() || !ibanAccount.trim() || !swiftBic.trim()) {
        setError("Please complete all required bank wire details (Bank Name, Beneficiary, IBAN, SWIFT/BIC).");
        return;
      }
      const parts = [
        `Bank: ${bankName.trim()}`,
        `Beneficiary: ${accountHolder.trim()}`,
        `IBAN/Acc: ${ibanAccount.trim()}`,
        `SWIFT: ${swiftBic.trim()}`,
        bankNote.trim() ? `Note: ${bankNote.trim()}` : "",
      ].filter(Boolean);
      destination = parts.join(" | ");
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onWithdrawSuccess(num, asset, destination);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Withdraw Capital</h3>
            <p className="text-xs text-brand-secondary">
              Available Free Margin: <span className="text-emerald-400 font-mono font-bold">{formatMoney(availableBalance)}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Withdrawal Asset / Method</label>
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
            >
              <option value="USDT" className="bg-brand-surface text-white">USDT (Tether)</option>
              <option value="BTC" className="bg-brand-surface text-white">Bitcoin (BTC)</option>
              <option value="USD" className="bg-brand-surface text-white">Bank Wire (USD / EUR / GBP)</option>
            </select>
          </div>

          {/* Dynamic Destination Details */}
          <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
              {isCrypto ? "Destination Wallet Address" : "Destination Bank Account Details"}
            </p>

            {isCrypto ? (
              <div className="space-y-3">
                {asset === "USDT" && (
                  <div>
                    <label className="text-xs text-brand-secondary">Transfer Network</label>
                    <select
                      value={walletNetwork}
                      onChange={(e) => setWalletNetwork(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                    >
                      <option value="TRC-20" className="bg-brand-surface text-white">TRC-20 (Tron - recommended)</option>
                      <option value="ERC-20" className="bg-brand-surface text-white">ERC-20 (Ethereum)</option>
                      <option value="BEP-20" className="bg-brand-surface text-white">BEP-20 (Binance Smart Chain)</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-brand-secondary">
                    {asset} Receiving Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={asset === "BTC" ? "bc1q... or 1... or 3..." : "Enter your wallet address"}
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none placeholder:text-brand-secondary/40"
                  />
                </div>
                <p className="text-[11px] text-amber-300/80">⚠ Double-check your address and network. Withdrawals sent to an incompatible address cannot be reversed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs text-brand-secondary">Bank Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Barclays, Chase"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none placeholder:text-brand-secondary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-brand-secondary">Account Beneficiary Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      placeholder="Full legal account name"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none placeholder:text-brand-secondary/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-brand-secondary">IBAN / Account Number <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                    value={ibanAccount}
                    onChange={(e) => setIbanAccount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none placeholder:text-brand-secondary/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-secondary">SWIFT / BIC Code <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. NWBKGB2L"
                    value={swiftBic}
                    onChange={(e) => setSwiftBic(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none placeholder:text-brand-secondary/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-brand-secondary">Additional Notes / Routing (Optional)</label>
                  <input
                    type="text"
                    placeholder="Sort code, transit number, reference..."
                    value={bankNote}
                    onChange={(e) => setBankNote(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none placeholder:text-brand-secondary/40"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-brand-secondary">Withdrawal Amount (USD)</label>
              <button
                type="button"
                onClick={() => setAmount(availableBalance.toFixed(2))}
                className="text-brand-primary hover:underline font-semibold"
              >
                Max All
              </button>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
            <ConvertedAmountPreview value={amount} />
          </div>
          <CurrencyDisclosure />

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1.5">
            <div className="flex justify-between">
              <span>Estimated Execution:</span>
              <span className="text-white font-semibold">Under 15 minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span className="text-white font-semibold font-mono">{isCrypto ? `${formatMoney(1)} USDT` : `${formatMoney(5)} USD`}</span>
            </div>
            <div className="flex justify-between">
              <span>Net Payout:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {formatMoney(Math.max(0, (parseFloat(amount) || 0) - (isCrypto ? 1 : 5)))}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="w-1/2 rounded-xl bg-amber-400 py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Withdrawal"}
          </button>
        </div>
        {error && (
          <div role="status" aria-live="polite" className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3. NEW ORDER / POSITION MODAL ──────────────────────────────────────────
interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (order: Omit<Position, "id" | "pnl" | "pnlPercent" | "openedAt">) => void;
  availableMargin: number;
}

const AVAILABLE_INSTRUMENTS = [
  { symbol: "BTC", name: "Bitcoin / USD", price: 64120.5, category: "crypto" },
  { symbol: "ETH", name: "Ethereum / USD", price: 2514.2, category: "crypto" },
  { symbol: "SOL", name: "Solana / USD", price: 148.8, category: "crypto" },
  { symbol: "EURUSD", name: "Euro / US Dollar", price: 1.0892, category: "forex" },
  { symbol: "GBPUSD", name: "British Pound / USD", price: 1.3065, category: "forex" },
  { symbol: "XAUUSD", name: "Gold / US Dollar", price: 2672.4, category: "commodities" },
  { symbol: "AAPL", name: "Apple Inc", price: 234.2, category: "shares" },
  { symbol: "TSLA", name: "Tesla Inc", price: 224.9, category: "shares" },
  { symbol: "SPX", name: "S&P 500 Index", price: 5815.0, category: "indices" },
];

export function NewOrderModal({ isOpen, onClose, onPlaceOrder, availableMargin }: NewOrderModalProps) {
  useDismissibleModal(isOpen, onClose);
  const [symbol, setSymbol] = useState("BTC");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [leverage, setLeverage] = useState(50);
  const [size, setSize] = useState("0.5");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentInst = AVAILABLE_INSTRUMENTS.find((i) => i.symbol === symbol) ?? AVAILABLE_INSTRUMENTS[0];
  const notional = (parseFloat(size) || 0) * currentInst.price;
  const requiredMargin = leverage > 0 ? notional / leverage : notional;

  const handleSubmit = () => {
    setError("");
    const numSize = parseFloat(size);
    if (isNaN(numSize) || numSize <= 0) {
      setError("Please specify a valid order size.");
      return;
    }
    if (requiredMargin > availableMargin) {
      setError(`Required margin of ${formatCurrency(requiredMargin, "USD")} exceeds free margin.`);
      return;
    }

    onPlaceOrder({
      symbol: currentInst.symbol,
      name: currentInst.name,
      category: currentInst.category as any,
      type: side,
      leverage,
      entryPrice: currentInst.price,
      markPrice: currentInst.price,
      size: numSize,
      margin: requiredMargin,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
    });
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Execute Order</h3>
            <p className="text-xs text-brand-secondary">Direct market routing with up to 100x leverage</p>
          </div>
        </div>

        {/* Long / Short Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setSide("BUY")}
            className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
              side === "BUY"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "border border-white/10 bg-white/5 text-brand-secondary"
            }`}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setSide("SELL")}
            className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
              side === "SELL"
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                : "border border-white/10 bg-white/5 text-brand-secondary"
            }`}
          >
            SELL / SHORT
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Instrument select */}
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Select Instrument</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#181d18] px-3 py-2 text-sm font-semibold text-white focus:border-brand-primary focus:outline-none"
            >
              {AVAILABLE_INSTRUMENTS.map((inst) => (
                <option key={inst.symbol} value={inst.symbol} className="bg-[#181d18] text-white">
                  {inst.symbol} — {inst.name} (${inst.price})
                </option>
              ))}
            </select>
          </div>

          {/* Leverage Slider */}
          <div>
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-brand-secondary">Leverage Multiplier</label>
              <span className="font-mono font-bold text-brand-primary">{leverage}x</span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {[1, 5, 10, 25, 50, 100].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 rounded-lg py-1 text-xs font-bold transition-all ${
                    leverage === lev
                      ? "bg-brand-primary text-black"
                      : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Order Size ({symbol})</label>
            <input
              type="number"
              step="any"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* TP & SL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-emerald-400">Take Profit Price</label>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-rose-400">Stop Loss Price</label>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white focus:border-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Margin requirement preview */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Total Position Notional:</span>
              <span className="text-white font-semibold">{formatCurrency(notional, "USD")}</span>
            </div>
            <div className="flex justify-between">
              <span>Required Margin ({leverage}x):</span>
              <span className="text-brand-primary font-bold">{formatCurrency(requiredMargin, "USD")}</span>
            </div>
          </div>
        </div>


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-1/2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              side === "BUY" ? "bg-emerald-400 text-black" : "bg-rose-500 text-white"
            } hover:brightness-105 active:scale-98`}
          >
            Confirm {side} Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 4. COPY TRADER MODAL ───────────────────────────────────────────────────
interface CopyTraderModalProps {
  provider: StrategyProvider | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCopy: (providerId: string, amount: number, maxDrawdown?: number) => void | Promise<void>;
}

export function CopyTraderModal({ provider, isOpen, onClose, onConfirmCopy }: CopyTraderModalProps) {
  useDismissibleModal(isOpen, onClose);
  const [allocation, setAllocation] = useState("5000");
  const [maxDrawdown, setMaxDrawdown] = useState("15");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !provider) return null;

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary font-bold text-lg border border-brand-primary/20">
            {provider.avatar}
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Copy {provider.name}</h3>
            <p className="text-xs text-brand-secondary">
              30d ROI: <span className="text-emerald-400 font-bold font-mono">+{provider.roi30d}%</span> • Win Rate: <span className="text-white font-mono">{provider.winRate}%</span>
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Allocation Capital ($ USD)</label>
            <input
              type="number"
              value={allocation}
              onChange={(e) => setAllocation(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-brand-secondary">Auto Stop-Loss Threshold (%)</label>
            <input
              type="number"
              value={maxDrawdown}
              onChange={(e) => setMaxDrawdown(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-brand-secondary">
              If copier equity drops by {maxDrawdown}%, all mirroring positions will instantly close to protect capital.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1">
            <div className="flex justify-between">
              <span>Management Fee:</span>
              <span className="text-emerald-400 font-semibold">0% (Completely Free)</span>
            </div>
            <div className="flex justify-between">
              <span>Execution Mode:</span>
              <span className="text-white font-semibold">Proportional Balance STP</span>
            </div>
          </div>
        </div>


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);
              try { await onConfirmCopy(provider.id, parseFloat(allocation) || 1000, parseFloat(maxDrawdown) || 15); onClose(); } finally { setIsSubmitting(false); }
            }}
            className="w-1/2 rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98"
          >
            {isSubmitting ? "Executing Mirror..." : "Start Mirror Trading"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 5. STAKE MODAL ─────────────────────────────────────────────────────────
interface StakeModalProps {
  vault: StakingVault | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmStake: (vaultId: string, amount: number) => Promise<boolean | void> | boolean | void;
  error?: string;
}

export function StakeModal({ vault, isOpen, onClose, onConfirmStake, error = "" }: StakeModalProps) {
  useDismissibleModal(isOpen, onClose);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !vault) return null;

  const numAmount = parseFloat(amount) || 0;
  const yearlyReward = (numAmount * vault.apy) / 100;
  const dailyReward = yearlyReward / 365;

  return (
    <div role="dialog" aria-modal="true" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-brand-surface p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-brand-secondary hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl font-extrabold text-black text-lg"
            style={{ backgroundColor: vault.iconBg }}
          >
            {vault.symbol.slice(0, 1)}
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white">Stake {vault.name}</h3>
            <p className="text-xs text-brand-secondary">
              Yield: <span className="text-brand-primary font-bold font-mono">{vault.apy}% APY</span> • {vault.period} lock
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-secondary">Stake Amount ({vault.symbol})</label>
            <input
              type="number"
              step="any"
              placeholder={`Min ${vault.minAmount} ${vault.symbol}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-brand-secondary space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Estimated Daily Reward:</span>
              <span className="text-emerald-400 font-bold">{dailyReward.toFixed(5)} {vault.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Annual Yield:</span>
              <span className="text-white font-bold">{yearlyReward.toFixed(4)} {vault.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Payout Schedule:</span>
              <span className="text-brand-secondary font-sans">Every 24 hours at 00:00 UTC</span>
            </div>
          </div>
        </div>


        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-brand-secondary hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={numAmount <= 0 || submitting}
            onClick={() => { void (async () => { setSubmitting(true); const result = await onConfirmStake(vault.id, numAmount); setSubmitting(false); if (result !== false) onClose(); })(); }}
            className="w-1/2 rounded-xl bg-brand-primary py-2.5 text-xs font-bold text-black hover:brightness-105 active:scale-98 disabled:opacity-50"
          >
            {submitting ? "Confirming…" : "Confirm Staking"}
          </button>
        </div>
        {error ? <p role="status" aria-live="polite" className="mt-3 text-xs leading-5 text-rose-200">{error}</p> : null}
      </div>
    </div>
  );
}
