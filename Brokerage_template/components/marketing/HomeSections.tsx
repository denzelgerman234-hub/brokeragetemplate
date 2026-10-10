"use client";

import Link from "next/link";
import {
  ArrowDownUp,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  Copy,
  Landmark,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { HeroAssetPanel } from "@/components/block/HeroAssetPanel";
import { LabelInput } from "@/components/block/LabelInput";
import { LiquidToggle } from "@/components/block/LiquidToggle";
import { PullToRefresh } from "@/components/block/PullToRefresh";
import { LiveMarketTable } from "@/components/markets/LiveMarketTable";
import { LiveTicker } from "@/components/markets/LiveTicker";
import { LinkButton } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import type { BrandConfig } from "@/config/brand.schema";
import type { MarketPoint, MarketQuote } from "@/lib/market-data/types";
import { useTranslation } from "@/context/LanguageContext";

type HomeSectionsProps = {
  brand: BrandConfig;
  quotes: MarketQuote[];
  histories: Record<string, MarketPoint[]>;
};



const testimonials = [
  {
    rating: 5,
    text: "Incredible company. I've been trading with them for months, had two fast withdrawals and a fee refund in under 48 hours. I absolutely recommend this firm.",
    initials: "LV",
    name: "Louis van Nuekerk",
  },
  {
    rating: 5,
    text: "An amazing platform that gives you real opportunity to achieve your goals and become a successful trader with outstanding financial tools and support.",
    initials: "AD",
    name: "Adam D.",
  },
  {
    rating: 5,
    text: "Great company, no issues with payouts, excellent customer support. Highly recommended for both beginner and experienced traders worldwide.",
    initials: "JS",
    name: "Jakub Szulc",
  },
  {
    rating: 5,
    text: "Legitimate and transparent. Nothing out there can compare to this level of service and platform reliability. Thank you for the opportunity.",
    initials: "DE",
    name: "Dee",
  },
  {
    rating: 5,
    text: "This platform has everything you could ask for. I'm super happy it was recommended to me as my very first broker. The experience has been flawless.",
    initials: "AV",
    name: "Agata Vincent",
  },
  {
    rating: 5,
    text: "Amazing execution speed — one of the best across the entire market. I genuinely recommend this platform to anyone serious about trading.",
    initials: "PK",
    name: "Pro Kittisak",
  },
];

export function HomeSections({ brand, quotes }: HomeSectionsProps) {
  const { t } = useTranslation();
  const [hoveredFeat, setHoveredFeat] = useState<number | null>(null);

  const marketMetrics = [
    { label: t.activeInstruments ?? "Active instruments", value: "50+", sub: t.instrumentsSub ?? "Across all asset classes" },
    { label: t.avgExecutionSpeed ?? "Avg. execution speed", value: "<7.8ms", sub: t.speedSub ?? "Ultra-low latency fills" },
    { label: t.uptimeGuarantee ?? "Uptime guarantee", value: "99.98%", sub: t.uptimeSub ?? "Mission-critical reliability" },
    { label: t.marketsSupported ?? "Markets supported", value: "180+", sub: t.marketsSub ?? "Countries with live access" },
  ];

  const features = [
    {
      icon: Copy,
      title: t.feat1Title ?? "One-click copy trading",
      body: t.feat1Body ?? "Copy the trades of experienced, verified strategy providers with a single click and mirror winning strategies automatically.",
      detail: "Our copy-trading engine lets you browse a ranked list of verified strategy providers, review their historical performance, risk profile, and drawdown stats — then subscribe with one click. Your account mirrors every trade in real time, proportional to your balance. Pause or stop at any moment with zero fees.",
      image: "/brands/default/feat-copy.svg",
      imageAlt: "Copy trading dashboard",
    },
    {
      icon: TrendingUp,
      title: t.feat2Title ?? "Up to 100x leverage",
      body: t.feat2Body ?? "Maximize your trading potential with up to 100x leverage on major crypto and forex pairs globally.",
      detail: "Select your leverage multiplier per position — from 2x to 100x on major crypto and forex pairs. Built-in risk guard caps exposure automatically when margin approaches the threshold. Fine-tune position size, set stop-loss and take-profit levels in the same view, all in under 10 seconds.",
      image: "/brands/default/feat-leverage.svg",
      imageAlt: "Leverage and risk management controls",
    },
    {
      icon: Zap,
      title: t.feat3Title ?? "Real-time execution",
      body: t.feat3Body ?? "Experience seamless order execution with sub-millisecond fills and tight spreads across all 50+ instruments.",
      detail: "Orders route through our proprietary low-latency engine with average fill times under 8ms. No last-look delays. No requotes. Tight spreads from 0.0 pips on major pairs. Slippage protection is active by default and can be customised per instrument from your account settings.",
      image: "/brands/default/feat-execution.svg",
      imageAlt: "Real-time execution speed chart",
    },
    {
      icon: Sparkles,
      title: t.feat4Title ?? "Demo accounts",
      body: t.feat4Body ?? "Test your strategies risk-free with a fully-featured demo account before committing real funds.",
      detail: "Demo accounts come preloaded with $100,000 in virtual funds and access every feature of the live platform — including copy trading, leverage controls, order types, and market data feeds. Switch between demo and live at any time from the account mode toggle. No credit card required.",
      image: "/brands/default/feat-demo.svg",
      imageAlt: "Demo account simulation interface",
    },
    {
      icon: Users,
      title: t.feat5Title ?? "Portfolio management",
      body: t.feat5Body ?? "Track all assets across every market in one unified view. Manage, rebalance, and monitor with ease.",
      detail: "Consolidate every position — crypto, stocks, forex, indices, and commodities — into a single portfolio dashboard. View unrealised P&L, allocation percentage, and historical performance side by side. Export reports in PDF or CSV, or connect to third-party analytics tools via our open API.",
      image: "/brands/default/feat-portfolio.svg",
      imageAlt: "Portfolio management dashboard",
    },
    {
      icon: BellRing,
      title: t.feat6Title ?? "24/7 live-chat support",
      body: t.feat6Body ?? "World-class support available around the clock. Average response time under 3 minutes — no bots.",
      detail: "Our multilingual support team is available 24 hours a day, 7 days a week via live chat, email, and phone. Average first-response time is under 3 minutes. Every agent is a trained market professional — no scripts, no bots. VIP clients receive a dedicated account manager.",
      image: "/brands/default/feat-support.svg",
      imageAlt: "24/7 live support chat interface",
    },
  ];

  const whyUs = [
    {
      icon: ShieldCheck,
      title: t.why1Title ?? "Unified asset management",
      body: t.why1Body ?? "Manage multiple asset classes and accounts from a single, beautifully designed interface — no tab-switching, no friction.",
    },
    {
      icon: Landmark,
      title: t.why2Title ?? "Global market access",
      body: t.why2Body ?? "Trade crypto, stocks, forex, and commodities in one account. 50+ markets. One login. Full control.",
    },
    {
      icon: ArrowDownUp,
      title: t.why3Title ?? "Fast deposits & withdrawals",
      body: t.why3Body ?? "Move funds in and out quickly with all major payment methods supported. Most withdrawals processed within 24–48 hours.",
    },
    {
      icon: Lock,
      title: t.why4Title ?? "Bank-grade security",
      body: t.why4Body ?? "256-bit AES encryption, 2FA, and 95% of user funds held in air-gapped cold wallets away from any network.",
    },
  ];

  const productCards = [
    {
      label: t.assetCrypto ?? "Crypto",
      href: "/cryptocurrencies",
      enabled: brand.features.cryptoTrading,
      body: t.assetCryptoBody ?? "Spot active digital-asset moves. Bitcoin, Ethereum, Solana, and 20+ more with live price feeds.",
    },
    {
      label: t.assetForex ?? "Forex",
      href: "/forex",
      enabled: brand.features.forex,
      body: t.assetForexBody ?? "Major and minor currency pairs with tight spreads, real-time data, and fast order execution.",
    },
    {
      label: t.assetStocks ?? "Stocks",
      href: "/shares",
      enabled: brand.features.shares,
      body: t.assetStocksBody ?? "Trade blue-chip equities alongside every other asset class from a single unified account.",
    },
    {
      label: t.assetIndices ?? "Indices",
      href: "/indices",
      enabled: brand.features.indices,
      body: t.assetIndicesBody ?? "Track broader market direction. S&P 500, NASDAQ, FTSE, DAX and more in one place.",
    },
    {
      label: t.assetCommodities ?? "Commodities",
      href: "/markets",
      enabled: true,
      body: t.assetCommoditiesBody ?? "Gold, silver, crude oil, natural gas, and agricultural products — all accessible in one account.",
    },
  ].filter((item) => item.enabled);

  const stakingRows = [
    { name: "Bitcoin", symbol: "BTC", apy: "4.5%", min: "0.001 BTC", period: t.stakingFlexible ?? "Flexible" },
    { name: "Ethereum", symbol: "ETH", apy: "5.8%", min: "0.05 ETH", period: t.stakingFlexible ?? "Flexible" },
    { name: "Solana", symbol: "SOL", apy: "7.2%", min: "1 SOL", period: "30 days" },
    { name: "Tether", symbol: "USDT", apy: "9.0%", min: "100 USDT", period: "90 days" },
  ];

  return (
    <main id="main-content">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(var(--color-primary),0.16),transparent_28%),radial-gradient(circle_at_75%_0%,rgba(255,255,255,0.08),transparent_24%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.94fr] lg:px-8">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary">
              {t.heroBadge ?? brand.brand.tagline}
            </p>
            {/* text-wrap:balance */}
            <h1
              id="hero-heading"
              className="max-w-4xl font-heading text-5xl font-semibold tracking-tight text-brand-text sm:text-6xl lg:text-7xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {t.heroHeadline ?? brand.content.hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-secondary" style={{ textWrap: "pretty" } as React.CSSProperties}>
              {t.heroSubheadline ?? brand.content.hero.subheadline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/auth/register">{t.heroPrimary ?? brand.content.hero.primaryCta}</LinkButton>
              <LinkButton href="/auth/login" variant="secondary">{t.heroSecondary ?? brand.content.hero.secondaryCta}</LinkButton>
            </div>

            {/* Stats */}
            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
              {[
                { value: "150K+", label: t.statTraders ?? "Active traders" },
                { value: "$2.4B", label: t.statVolume ?? "Monthly volume" },
                { value: "99.98%", label: t.statUptime ?? "Platform uptime" },
                { value: "50+", label: t.statMarkets ?? "Global markets" },
              ].map((stat) => (
                <div key={stat.label} className="hero-stat">
                  <p className="hero-stat-value">{stat.value}</p>
                  <p className="hero-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <HeroAssetPanel quotes={quotes} currency={brand.currencyDefault} />
        </div>
      </section>

      {/* ── Live ticker ───────────────────────────────────────────────────── */}
      <LiveTicker quotes={quotes} currency={brand.currencyDefault} />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.featuresEyebrow ?? "Features"}
        title={t.featuresTitle ?? "All the features you need for profits"}
        body={t.featuresBody ?? "Everything a modern trader needs — built into one seamless, powerful platform."}
      >
        <div
          className="feat-grid"
          onMouseLeave={() => setHoveredFeat(null)}
          data-active={hoveredFeat !== null ? "true" : "false"}
        >
          {features.map((feat, index) => {
            const Icon = feat.icon;
            const isActive = hoveredFeat === index;
            const isHidden = hoveredFeat !== null && !isActive;
            return (
              <div
                key={feat.title}
                className="feat-card"
                data-active={isActive ? "true" : "false"}
                data-hidden={isHidden ? "true" : "false"}
                onMouseEnter={() => setHoveredFeat(index)}
              >
                {/* Collapsed view */}
                <div className="feat-card-face">
                  <Icon className="h-7 w-7 text-brand-primary" />
                  <h3 className="mt-5 font-heading text-lg font-semibold">{feat.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-brand-secondary">{feat.body}</p>
                </div>
                {/* Expanded view (shown on hover) */}
                <div className="feat-card-expanded">
                  <div className="feat-card-expanded-content">
                    <Icon className="h-8 w-8 text-brand-primary" />
                    <h3 className="mt-5 font-heading text-2xl font-semibold">{feat.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-brand-secondary">{feat.detail}</p>
                    <Link
                      href="/auth/register"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-opacity hover:opacity-80"
                    >
                      Get started <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="feat-card-expanded-image">
                    <img src={feat.image} alt={feat.imageAlt} loading="lazy" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Why us ───────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.whyUsEyebrow ?? "Why choose us"}
        title={t.whyUsTitle ?? "Everything you need to trade, in one place"}
        body={t.whyUsBody ?? "Manage assets, place trades, track progress, and move funds seamlessly across markets, accounts, and devices."}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[calc(var(--radius-brand)+12px)] bg-brand-surface p-6 shadow-border transition-[box-shadow] duration-150 hover:shadow-border-hover"
              >
                <Icon className="h-7 w-7 text-brand-primary" />
                <h3 className="mt-5 font-heading text-base font-semibold" style={{ textWrap: "balance" } as React.CSSProperties}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">{item.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Markets ──────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.marketsEyebrow ?? "Markets"}
        title={t.marketsTitle ?? "See what is moving before you decide"}
        body={t.marketsBody ?? "Real-time prices, daily movement, and market context across crypto, forex, stocks, and commodities."}
      >
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] items-start">
          {/* Professional market metrics sidebar */}
          <div className="flex flex-col gap-3">
            {marketMetrics.map((metric) => (
              <div key={metric.label} className="mkt-metric-card">
                <p className="mkt-metric-value">{metric.value}</p>
                <p className="mkt-metric-label">{metric.label}</p>
                <p className="mkt-metric-sub">{metric.sub}</p>
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <PullToRefresh>
              <LiveMarketTable quotes={quotes} currency={brand.currencyDefault} pageSize={6} />
            </PullToRefresh>
          </div>
        </div>
      </Section>

      {/* ── Supported assets ─────────────────────────────────────────────── */}
      <Section
        eyebrow={t.assetsEyebrow ?? "Supported assets"}
        title={t.assetsTitle ?? "Trade the world's biggest assets"}
        body={t.assetsBody ?? "From Bitcoin to blue-chip stocks — access 50+ markets from one account."}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {productCards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-5 shadow-border transition-[box-shadow,transform] duration-150 hover:shadow-border-hover active:scale-[0.96]"
            >
              <ArrowUpRight className="mb-6 h-6 w-6 text-brand-primary transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <h3 className="font-heading text-lg font-semibold group-hover:text-brand-primary">{item.label}</h3>
              <p className="mt-3 text-sm leading-6 text-brand-secondary">{item.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── Staking ──────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.stakingEyebrow ?? "Earn while you hold"}
        title={t.stakingTitle ?? "Staking — put your crypto to work"}
        body={t.stakingBody ?? "Stake your assets and earn passive rewards daily with no lock-in commitment on flexible plans."}
      >
        <div className="overflow-hidden rounded-[calc(var(--radius-brand)+12px)] border border-white/10 bg-brand-surface shadow-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-brand-secondary">
                <th className="px-5 py-4 text-left font-semibold">{t.stakingAsset ?? "Asset"}</th>
                <th className="px-5 py-4 text-left font-semibold tabular-nums">{t.stakingApy ?? "APY"}</th>
                <th className="hidden px-5 py-4 text-left font-semibold sm:table-cell">{t.stakingMin ?? "Min. stake"}</th>
                <th className="hidden px-5 py-4 text-left font-semibold md:table-cell">{t.stakingPeriod ?? "Lock period"}</th>
              </tr>
            </thead>
            <tbody>
              {stakingRows.map((row, i) => (
                <tr
                  key={row.symbol}
                  className={`transition-colors duration-100 hover:bg-white/[0.03] ${i < stakingRows.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <td className="px-5 py-4">
                    <span className="font-medium">{row.name}</span>{" "}
                    <span className="text-brand-secondary">{row.symbol}</span>
                  </td>
                  <td className="px-5 py-4 tabular-nums font-semibold text-brand-primary">{row.apy}</td>
                  <td className="hidden px-5 py-4 tabular-nums text-brand-secondary sm:table-cell">{row.min}</td>
                  <td className="hidden px-5 py-4 text-brand-secondary md:table-cell">{row.period}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-white/10 px-5 py-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-[opacity] duration-150 hover:opacity-80"
            >
              {t.stakingStartLink ?? "Start earning now"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── Trading tools ────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.toolsEyebrow ?? "Trading tools"}
        title={t.toolsTitle ?? "Tools that move at market speed"}
        body={t.toolsBody ?? "Switch between practice and live modes, set a risk preference, and subscribe to market updates without leaving the page you are using."}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Mode toggle */}
          <div className="rounded-[calc(var(--radius-brand)+12px)] bg-brand-surface p-6 shadow-border">
            <Zap className="h-7 w-7 text-brand-primary" />
            <h3 className="mt-6 font-heading text-xl font-semibold">{t.tool1Title ?? "Account mode"}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {t.tool1Body ?? "Switch between demo and live trading instantly. Practice strategies before committing real capital — no risk, full experience."}
            </p>
            <div className="mt-6 space-y-4">
              <LiquidToggle label={t.tool1Title ?? "Account mode"} checkedLabel={t.tool1Live ?? "Live"} uncheckedLabel={t.tool1Demo ?? "Demo"} />
              <LiquidToggle label={t.tool1RiskGuard ?? "Risk guard"} checkedLabel={t.tool1On ?? "On"} uncheckedLabel={t.tool1Off ?? "Off"} defaultChecked />
            </div>
          </div>

          {/* Leverage card */}
          <div className="rounded-[calc(var(--radius-brand)+12px)] bg-brand-surface p-6 shadow-border">
            <TrendingUp className="h-7 w-7 text-brand-primary" />
            <h3 className="mt-6 font-heading text-xl font-semibold">{t.tool2Title ?? "Up to 100x leverage"}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {t.tool2Body ?? "Fine-tune your exposure with responsive controls and clear risk boundaries. Scale positions with confidence on major crypto and forex pairs."}
            </p>
            <Link
              href="/trade"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary transition-[opacity] duration-150 hover:opacity-80"
            >
              {t.tool2Link ?? "Open trade desk"}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Alerts card */}
          <div className="rounded-[calc(var(--radius-brand)+12px)] bg-brand-surface p-6 shadow-border">
            <BellRing className="h-7 w-7 text-brand-primary" />
            <h3 className="mt-6 font-heading text-xl font-semibold">{t.tool3Title ?? "Smart alerts"}</h3>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {t.tool3Body ?? "Receive market updates at the frequency you choose. Change or cancel alerts from your account settings at any time."}
            </p>
            <form className="mt-5 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <LabelInput label={t.tool3EmailPlaceholder ?? "Email"} type="email" name="email" />
              <button
                type="submit"
                className="w-full rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
              >
                {t.tool3Button ?? "Notify me"}
              </button>
            </form>
          </div>
        </div>
      </Section>

      {/* ── Security ─────────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.securityEyebrow ?? "Security"}
        title={t.securityTitle ?? "Bank-grade security for your assets"}
        body={t.securityBody ?? "Your funds and data are protected by industry-leading encryption, 2FA, and cold wallet storage — at every level of the platform."}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Lock,
              title: t.sec1Title ?? "256-bit AES encryption",
              body: t.sec1Body ?? "All data and transactions encrypted end-to-end with military-grade standards. Nothing leaves the platform unprotected.",
            },
            {
              icon: ShieldCheck,
              title: t.sec2Title ?? "Cold wallet storage",
              body: t.sec2Body ?? "95% of user funds are kept offline in air-gapped cold wallets, away from any network — protected against any breach.",
            },
            {
              icon: BadgeCheck,
              title: t.sec3Title ?? "Regulatory compliance",
              body: t.sec3Body ?? "Fully licensed and compliant with international financial regulations. Operating transparently across all regions we serve.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-6 shadow-border"
              >
                <Icon className="h-7 w-7 text-brand-primary" />
                <h3 className="mt-6 font-heading text-xl font-semibold" style={{ textWrap: "balance" } as React.CSSProperties}>
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-brand-secondary">{item.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Who we are ───────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.whoEyebrow ?? "Who we are"}
        title={t.whoTitle ?? "Built by traders, for traders"}
        body={t.whoBody ?? "Founded with a single mission: give every person on the planet access to the world's financial markets. A multi-asset brokerage serving clients across 180+ countries with transparent pricing and award-winning support."}
      >
        <div className="who-stats-banner">
          {[
            { value: "2018", label: t.statFounded ?? "Founded" },
            { value: "150K+", label: t.statActiveTraders ?? "Active traders" },
            { value: "180+", label: t.statCountries ?? "Countries served" },
          ].map((stat) => (
            <div key={stat.label} className="who-stat-item">
              <p className="who-stat-value">{stat.value}</p>
              <p className="who-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <Section
        eyebrow={t.testimonialsEyebrow ?? "Testimonials"}
        title={t.testimonialsTitle ?? "Traders and investors love us"}
        body={t.testimonialsBody ?? "Discover what 150,000+ traders from 180+ countries are saying about their experience."}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="flex flex-col rounded-[calc(var(--radius-brand)+12px)] bg-brand-surface p-6 shadow-border"
            >
              <p className="text-xs tracking-[0.1em] text-brand-primary">{"★".repeat(item.rating)}</p>
              <p className="mt-3 flex-1 text-sm leading-6 text-brand-secondary" style={{ textWrap: "pretty" } as React.CSSProperties}>
                {item.text}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-black">
                  {item.initials}
                </span>
                <p className="text-sm font-semibold">{item.name}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="border-t border-white/10" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 rounded-[calc(var(--radius-brand)+16px)] bg-brand-primary p-8 text-black sm:p-10 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <h2
                id="cta-heading"
                className="font-heading text-3xl font-semibold sm:text-4xl"
                style={{ textWrap: "balance" } as React.CSSProperties}
              >
                {t.ctaTitle ?? "Start trading with confidence today"}
              </h2>
              <p className="mt-4 max-w-2xl text-black/70" style={{ textWrap: "pretty" } as React.CSSProperties}>
                {t.ctaBody ?? "Join over 150,000 traders already on the platform. Create your free account in under two minutes."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-brand bg-black px-5 py-3 text-sm font-semibold text-white transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
              >
                {t.ctaPrimary ?? "Create free account"}
              </Link>
              <Link
                href="/contacts"
                className="inline-flex items-center justify-center rounded-brand bg-black/10 px-5 py-3 text-sm font-semibold text-black transition-[opacity,transform,background-color] duration-150 hover:bg-black/15 active:scale-[0.96]"
              >
                {t.ctaSecondary ?? "Talk to support"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
