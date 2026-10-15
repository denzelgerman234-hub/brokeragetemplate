"use client";

import { useEffect, useState } from "react";
import { Sparkles, Coins, CheckCircle2, Lock, ArrowUpRight, Award } from "lucide-react";
import { stakingVaults as initialVaults } from "@/components/dashboard/data";
import type { StakingVault } from "@/components/dashboard/types";
import { StakeModal } from "@/components/dashboard/Modals";
import { useCurrency } from "@/context/CurrencyContext";

export function StakingEarnView() {
  const { formatMoney } = useCurrency();
  const [vaults, setVaults] = useState(initialVaults);
  const [selectedVault, setSelectedVault] = useState<StakingVault | null>(null);
  const [plan, setPlan] = useState<{ stakingApyBonus: number; badgeLabel: string } | null>(null);
  useEffect(() => { fetch("/api/membership").then((response) => response.ok ? response.json() : null).then((data) => setPlan(data?.currentPlan ?? null)).catch(() => {}); }, []);
  const apyBonus = plan?.stakingApyBonus ?? 0;

  // Active user stakes
  const [activeStakes, setActiveStakes] = useState([
    {
      id: "stk-1",
      vaultId: "stake-usdt",
      asset: "USDT",
      name: "Tether Dollar Pool",
      amount: 15000,
      apy: 9.0,
      earnedReward: 332.87,
      period: "90 days",
      daysLeft: 42,
    },
    {
      id: "stk-2",
      vaultId: "stake-btc",
      asset: "BTC",
      name: "Bitcoin Vault",
      amount: 0.25,
      apy: 4.5,
      earnedReward: 0.0031,
      period: "Flexible",
      daysLeft: 0,
    },
  ]);

  const [claimNotice, setClaimNotice] = useState<string | null>(null);
  const [stakeError, setStakeError] = useState("");

  function handleClaimReward(stakeId: string) {
    const stk = activeStakes.find((s) => s.id === stakeId);
    if (!stk) return;
    setClaimNotice(`Claimed ${stk.earnedReward} ${stk.asset} to Main Funding Wallet.`);
    setActiveStakes((prev) =>
      prev.map((s) => (s.id === stakeId ? { ...s, earnedReward: 0 } : s))
    );
    setTimeout(() => setClaimNotice(null), 3000);
  }

  async function handleConfirmStake(vaultId: string, amount: number) {
    const v = vaults.find((vault) => vault.id === vaultId);
    if (!v) return false;
    const response = await fetch("/api/staking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ asset: v.symbol, amount, baseApy: v.apy }) });
    const data = await response.json().catch(() => null) as { error?: string; stake?: { id?: string } } | null;
    if (!response.ok) { setStakeError(data?.error ?? "We couldn’t create this stake."); return false; }
    const newStake = { id: data?.stake?.id ?? `stk-${Date.now()}`, vaultId, asset: v.symbol, name: v.name, amount, apy: v.apy + apyBonus, earnedReward: 0, period: v.period, daysLeft: v.period === "Flexible" ? 0 : 30 };
    setActiveStakes((prev) => [newStake, ...prev]);
    setStakeError("");
    setClaimNotice(`Staked ${amount} ${v.symbol} in ${v.name}. Daily yield accrual started.`);
    setTimeout(() => setClaimNotice(null), 3000);
    return true;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Passive Yield Generation</p>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Staking & Yield Vaults</h1>
        <p className="text-xs text-brand-secondary mt-1">
          Lock idle digital assets or subscribe to flexible daily compounding liquidity pools with bank-grade security.
        </p>
      </div>
      {apyBonus > 0 && <div className="rounded-xl border border-brand-primary/30 bg-brand-primary/10 p-3 text-sm font-semibold text-brand-primary">{plan?.badgeLabel} +{apyBonus}% APY Booster Active</div>}

      {claimNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-semibold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" />
          <span>{claimNotice}</span>
        </div>
      )}

      {/* Aggregate Yield Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-primary/20 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Total Capital In Staking
          </span>
          <div className="mt-2 text-2xl font-extrabold text-white font-mono sm:text-3xl">
            {formatMoney(31250)}
          </div>
          <p className="mt-1 text-xs text-brand-secondary">Across 2 active yield vaults</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Total Accrued Yield
          </span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono sm:text-3xl">
            +{formatMoney(531.5)}
          </div>
          <p className="mt-1 text-xs text-emerald-400 font-mono">Disbursed automatically every 24h</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-5 shadow-sm backdrop-blur-md">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">
            Average APY
          </span>
          <div className="mt-2 text-2xl font-extrabold text-brand-primary font-mono sm:text-3xl">
            7.85% APY
          </div>
          <p className="mt-1 text-xs text-brand-secondary">Audited smart vault contracts</p>
        </div>
      </div>

      {/* Active User Stakes */}
      <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-heading text-lg font-bold text-white">Your Active Staking Positions</h3>
          <p className="text-xs text-brand-secondary">Claim accumulated daily rewards or review unlock schedules.</p>
        </div>

        <div className="mt-4 divide-y divide-white/5 text-xs">
          {activeStakes.map((stake) => (
            <div key={stake.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{stake.name}</h4>
                  <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                    {stake.apy}% APY
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-brand-secondary font-mono text-[11px]">
                  <span>Principal: {stake.amount} {stake.asset}</span>
                  <span>•</span>
                  <span>Lock Type: {stake.period}</span>
                  {stake.daysLeft > 0 ? (
                    <>
                      <span>•</span>
                      <span className="text-amber-400">{stake.daysLeft} days until unlock</span>
                    </>
                  ) : (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400">Flexible (Instant Unstake)</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-400 text-sm">
                    +{stake.earnedReward} {stake.asset}
                  </span>
                  <p className="text-[10px] text-brand-secondary">Unclaimed Reward</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleClaimReward(stake.id)}
                  disabled={stake.earnedReward === 0}
                  className="rounded-xl bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-black transition-all hover:brightness-105 active:scale-95 disabled:opacity-40"
                >
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Vaults Directory */}
      <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-heading text-lg font-bold text-white">Available Yield Pools</h3>
          <p className="text-xs text-brand-secondary">Institutional staking contracts with transparent reward compounding.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-black text-xs"
                      style={{ backgroundColor: vault.iconBg }}
                    >
                      {vault.symbol.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{vault.name}</h4>
                      <p className="text-xs text-brand-secondary">{vault.symbol}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-xs font-mono font-bold text-brand-primary">
                    {vault.apy + apyBonus}% APY
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-black/30 p-2.5 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-brand-secondary">
                    <span>Lock:</span>
                    <span className="text-white">{vault.period}</span>
                  </div>
                  <div className="flex justify-between text-brand-secondary">
                    <span>Min:</span>
                    <span className="text-white">{vault.minAmount} {vault.symbol}</span>
                  </div>
                  <div className="flex justify-between text-brand-secondary">
                    <span>Pool:</span>
                    <span className="text-white">{vault.totalStaked}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3">
                <button
                  type="button"
                  onClick={() => { setStakeError(""); setSelectedVault(vault); }}
                  className="w-full rounded-xl bg-white/10 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-primary hover:text-black"
                >
                  Stake {vault.symbol}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <StakeModal
        vault={selectedVault}
        isOpen={selectedVault !== null}
        onClose={() => setSelectedVault(null)}
        onConfirmStake={handleConfirmStake}
      error={stakeError}
      />
    </div>
  );
}
