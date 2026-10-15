"use client";

import { useState } from "react";
import { Users, Award, Shield, Check, Play, Pause, X, ArrowUpRight } from "lucide-react";
import { strategyProviders } from "@/components/dashboard/data";
import type { StrategyProvider } from "@/components/dashboard/types";
import { Sparkline } from "@/components/markets/Sparkline";
import { CopyTraderModal } from "@/components/dashboard/Modals";
import { useCopyTrading } from "@/lib/services/copyTrading";
import { useCurrency } from "@/context/CurrencyContext";

export function CopyTradingView() {
  const { currency, formatMoney } = useCurrency();
  const [providers, setProviders] = useState(strategyProviders);
  const [selectedProvider, setSelectedProvider] = useState<StrategyProvider | null>(null);

  const { subscriptions, copyProvider, pauseSubscription, resumeSubscription, revokeSubscription } = useCopyTrading();
  async function handleConfirmCopy(providerId: string, amount: number, maxDrawdown = 15) {
    const provider = providers.find((item) => item.id === providerId);
    if (provider) await copyProvider(provider, amount, maxDrawdown);
  }

  const totalAllocated = subscriptions.reduce((a, b) => a + b.allocatedAmount, 0);
  const totalCopyPnl = 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Automated Social Trading</p>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Copy Trading Management</h1>
        <p className="text-xs text-brand-secondary mt-1">
          Mirror trades from verified market leaders with automatic position sizing and capital drawdown protection. {currency !== "USD" ? `Displayed amounts are converted to ${currency}; trades settle in USD.` : ""}
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Total Capital In Mirroring
          </span>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono sm:text-3xl">
            {formatMoney(totalAllocated)}
          </div>
          <p className="mt-1 text-xs text-brand-secondary">Across {subscriptions.length} active strategy providers</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Net Copy Trading Profits
          </span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono sm:text-3xl">
            +{formatMoney(totalCopyPnl)}
          </div>
          <p className="mt-1 text-xs text-emerald-400 font-mono">+19.3% average return</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Execution SLA
          </span>
          <div className="mt-2 text-xl font-bold text-white font-mono">
            &lt; 5ms Proportional Fill
          </div>
          <p className="mt-1 text-xs text-brand-secondary">Direct memory bus mirror routing</p>
        </div>
      </div>

      {/* Section 1: Active Subscriptions */}
      <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-heading text-lg font-bold text-white">Your Active Strategy Subscriptions</h3>
          <p className="text-xs text-brand-secondary">Manage capital allocated to each master trader and pause/resume execution.</p>
        </div>

        {subscriptions.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-secondary">
            You are not currently copying any strategy providers. Browse verified traders below to start mirroring.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-white/5 text-xs">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-white text-sm">{sub.providerName}</h4>
                    <span className="text-brand-secondary font-mono">{sub.providerHandle}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        sub.status === "ACTIVE"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-brand-secondary font-mono text-[11px]">
                    <span>Allocated: {formatMoney(sub.allocatedAmount)}</span>
                    <span>•</span>
                    <span>Max Stop-Loss: {sub.maxDrawdown}%</span>
                    <span>•</span>
                    <span>Started: {new Date(sub.startedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <span className="font-bold text-emerald-400 text-sm">Live tracking</span>
                    <p className="text-[11px] text-emerald-400/80">Ready for provider P&amp;L feed</p>
                  </div>

                  <div className="flex items-center gap-1.5 font-sans">
                    <button
                      type="button"
                      onClick={() => sub.status === "ACTIVE" ? pauseSubscription(sub.id) : resumeSubscription(sub.id)}
                      className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        sub.status === "ACTIVE"
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {sub.status === "ACTIVE" ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      <span>{sub.status === "ACTIVE" ? "Pause" : "Resume"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => revokeSubscription(sub.id)}
                      className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-brand-secondary hover:bg-rose-500/10 hover:text-rose-400"
                      title="Stop copying & detach"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Verified Strategy Providers Directory */}
      <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-heading text-lg font-bold text-white">Verified Master Traders Directory</h3>
          <p className="text-xs text-brand-secondary">Audited performance metrics with real funds under management.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 font-bold text-white">
                      {p.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.name}</h4>
                      <p className="text-xs text-brand-secondary">{p.handle}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-brand-secondary">
                    Risk {p.riskScore}/5
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-black/30 p-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-brand-secondary uppercase">30d ROI</span>
                    <p className="font-bold text-emerald-400">+{p.roi30d}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-secondary uppercase">Win Rate</span>
                    <p className="font-bold text-white">{p.winRate}%</p>
                  </div>
                </div>

                <div className="mt-3">
                  <Sparkline points={p.sparkline} positive className="h-8 w-full" />
                </div>

                <p className="mt-3 text-xs text-brand-secondary line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(p)}
                  className="w-full rounded-xl bg-brand-primary py-2 text-xs font-bold text-black transition-all hover:brightness-105 active:scale-98"
                >
                  Copy Strategy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CopyTraderModal
        provider={selectedProvider}
        isOpen={selectedProvider !== null}
        onClose={() => setSelectedProvider(null)}
        onConfirmCopy={handleConfirmCopy}
      />
    </div>
  );
}
