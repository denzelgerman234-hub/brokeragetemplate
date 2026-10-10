"use client";

import { ArrowDown, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { useTranslation } from "@/context/LanguageContext";

export type Asset = {
  symbol: string;
  name: string;
  price: number;
  color: string;
};

export const ASSETS: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67200, color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", price: 3440, color: "#8ea2ff" },
  { symbol: "SOL", name: "Solana", price: 148, color: "#76f7d2" },
  { symbol: "USD", name: "US Dollar", price: 1, color: "#d8e6df" },
  { symbol: "EUR", name: "Euro", price: 1.08, color: "#9db7ff" },
];

const bySymbol = Object.fromEntries(ASSETS.map((asset) => [asset.symbol, asset])) as Record<string, Asset>;

export function AssetSwap({ onAssetChange }: { onAssetChange?: (symbol: string) => void }) {
  const { t } = useTranslation();
  const [symbols, setSymbols] = useState<[string, string]>(["BTC", "USD"]);
  const [turns, setTurns] = useState(0);
  const [picker, setPicker] = useState<number | null>(null);
  const payer = turns % 2 === 0 ? 0 : 1;
  const lot = symbols[payer] === "USD" ? 5000 : symbols[payer] === "EUR" ? 4600 : 0.08;
  const value = lot * bySymbol[symbols[payer]].price;

  function amountFor(index: number) {
    const asset = bySymbol[symbols[index]];
    const amount = index === payer ? lot : (value * 0.997) / asset.price;
    return asset.symbol === "USD" || asset.symbol === "EUR"
      ? amount.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : amount.toLocaleString("en-US", { maximumFractionDigits: 5 });
  }

  function choose(symbol: string) {
    if (picker === null) return;
    setSymbols((current) => {
      const next: [string, string] = [current[0], current[1]];
      const other = 1 - picker;
      if (next[other] === symbol) next[other] = next[picker];
      next[picker] = symbol;
      return next;
    });
    onAssetChange?.(symbol);
    setPicker(null);
  }

  return (
    <div className="swp">
      {symbols.map((symbol, index) => {
        const asset = bySymbol[symbol];
        const open = picker === index;
        const role = index === payer ? (t.youPay ?? "You pay") : (t.youReceive ?? "You receive");
        return (
          <motion.div
            key={index}
            className="swp-card"
            data-lifted={open || undefined}
            initial={false}
            animate={{ top: open ? 0 : index * 119, height: open ? 235 : 116, opacity: picker !== null && !open ? 0 : 1 }}
            transition={{ type: "spring", duration: 0.55, bounce: 0.14 }}
          >
            <motion.div className="swp-face" animate={{ opacity: open ? 0 : 1 }}>
              <span className="swp-label">{role}</span>
              <span className="swp-amount">{amountFor(index)}</span>
              <span className="swp-fiat">${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
              <button type="button" className="swp-coin" onClick={() => setPicker(index)}>
                <span className="swp-token" style={{ background: asset.color }}>{asset.symbol.slice(0, 1)}</span>
                {asset.symbol}
              </button>
            </motion.div>
            <AnimatePresence>
              {open ? (
                <motion.div className="swp-pick-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="swp-pick-head">
                    <span>{role}</span>
                    <button type="button" className="swp-pick-x" onClick={() => setPicker(null)} aria-label="Close asset picker">
                      <X size={16} />
                    </button>
                  </div>
                  {ASSETS.map((option) => (
                    <button key={option.symbol} type="button" className="swp-pick-row" onClick={() => choose(option.symbol)}>
                      <span className="swp-token" style={{ background: option.color }}>{option.symbol.slice(0, 1)}</span>
                      <span className="swp-pick-sym">{option.symbol}</span>
                      <span className="swp-pick-name">{option.name}</span>
                      {symbol === option.symbol ? <Check className="swp-pick-on" size={16} /> : null}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
      <motion.button
        type="button"
        className="swp-flip"
        animate={{ rotate: turns * 180, opacity: picker === null ? 1 : 0, scale: picker === null ? 1 : 0.6 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.28 }}
        onClick={() => setTurns((count) => count + 1)}
        aria-label="Reverse conversion direction"
      >
        <ArrowDown size={18} />
      </motion.button>
    </div>
  );
}
