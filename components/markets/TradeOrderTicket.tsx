"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { MarketQuote } from "@/lib/market-data/types";

interface TradeOrderTicketProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  instrument: MarketQuote;
  currency: string;
}

const LEVERAGE_OPTIONS = [1, 5, 10, 25, 50, 100];

function formatPrice(n: number): string {
  if (n >= 100) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

export function TradeOrderTicket({ user, instrument, currency }: TradeOrderTicketProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [leverage, setLeverage] = useState(10);
  const [size, setSize] = useState("0.1");
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [orderType, setOrderType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [limitPrice, setLimitPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const numSize = parseFloat(size) || 0;
  const markPrice = instrument.price;
  const notional = numSize * markPrice;
  const requiredMargin = leverage > 0 ? notional / leverage : notional;
  const pipValue = markPrice > 0 ? (notional * 0.0001) : 0;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader";

  const handleSubmit = () => {
    setError("");
    if (numSize <= 0) {
      setError("Please enter a valid order size.");
      return;
    }
    if (orderType === "LIMIT" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      setError("Please enter a valid limit price.");
      return;
    }
    // Simulate order placement
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="rounded-brand bg-brand-background/45 p-5 h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-white">Order Ticket</h2>
          <p className="text-xs text-brand-secondary mt-0.5">
            Trading as{" "}
            <span className="text-brand-primary font-semibold">{fullName}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-mono text-lg font-bold text-white">
            ${formatPrice(markPrice)}
          </span>
          <span
            className={`text-xs font-semibold ${
              instrument.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {instrument.change24h >= 0 ? "+" : ""}
            {instrument.change24h.toFixed(2)}% (24h)
          </span>
        </div>
      </div>

      {/* BUY / SELL */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSide("BUY")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
            side === "BUY"
              ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25"
              : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          BUY / LONG
        </button>
        <button
          type="button"
          onClick={() => setSide("SELL")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all ${
            side === "SELL"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
              : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          SELL / SHORT
        </button>
      </div>

      {/* Order Type Toggle */}
      <div className="flex rounded-xl border border-white/10 bg-brand-surface/50 p-1 gap-1">
        {(["MARKET", "LIMIT"] as const).map((ot) => (
          <button
            key={ot}
            type="button"
            onClick={() => setOrderType(ot)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              orderType === ot
                ? "bg-brand-primary text-black shadow-sm"
                : "text-brand-secondary hover:text-white"
            }`}
          >
            {ot}
          </button>
        ))}
      </div>

      {/* Limit price (conditional) */}
      {orderType === "LIMIT" && (
        <div>
          <label className="text-xs font-semibold text-brand-secondary">Limit Price ({currency})</label>
          <input
            type="number"
            step="any"
            placeholder={`e.g. ${formatPrice(markPrice * 0.99)}`}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
          />
        </div>
      )}

      {/* Leverage */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold text-brand-secondary">Leverage</span>
          <span className="font-mono font-bold text-brand-primary">{leverage}x</span>
        </div>
        <div className="flex gap-1.5">
          {LEVERAGE_OPTIONS.map((lev) => (
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
        <label className="text-xs font-semibold text-brand-secondary">Order Size ({instrument.symbol})</label>
        <input
          type="number"
          step="any"
          min="0"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:border-brand-primary focus:outline-none"
        />
      </div>

      {/* TP / SL */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-emerald-400">Take Profit</label>
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
          <label className="text-xs font-semibold text-rose-400">Stop Loss</label>
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

      {/* Order Summary */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs space-y-1.5">
        <div className="flex justify-between">
          <span className="text-brand-secondary">Notional Value</span>
          <span className="font-mono text-white font-semibold">
            ${notional.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-secondary">Required Margin</span>
          <span className="font-mono text-brand-primary font-bold">
            ${requiredMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-secondary">Est. Pip Value</span>
          <span className="font-mono text-white">
            ${pipValue.toFixed(4)}
          </span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-1.5">
          <span className="text-brand-secondary">Mark Price</span>
          <span className="font-mono text-amber-400 font-semibold">${formatPrice(markPrice)}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success */}
      {submitted && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-400 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Order submitted — routed to {side === "BUY" ? "long" : "short"} book at{" "}
          {orderType === "MARKET" ? "market price" : `$${limitPrice}`}.
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        className={`w-full rounded-xl py-3 text-sm font-bold shadow-lg transition-all active:scale-98 ${
          side === "BUY"
            ? "bg-emerald-500 text-black shadow-emerald-500/20 hover:brightness-110"
            : "bg-rose-500 text-white shadow-rose-500/20 hover:brightness-110"
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          <Zap className="h-4 w-4" />
          {side === "BUY" ? "Execute Buy / Long" : "Execute Sell / Short"} — {leverage}x
        </span>
      </button>

      {/* Quick links */}
      <div className="flex items-center justify-between text-[11px] text-brand-secondary border-t border-white/10 pt-3">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-primary" />
          KYC Level 2 Verified
        </span>
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-brand-primary hover:underline font-semibold"
        >
          Go to Dashboard <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
