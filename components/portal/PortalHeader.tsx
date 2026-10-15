"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import {
  Bell,
  ChevronDown,
  ShieldCheck,
  User,
  Settings,
  Lock,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { getBrandConfig } from "@/config/loadBrandConfig";
import { useAuth } from "@/context/AuthContext";
import { CurrencyDisclosure } from "@/components/currency/CurrencyDisclosure";
import { useCurrency } from "@/context/CurrencyContext";

interface PortalHeaderProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  mode?: "live" | "demo";
  onModeToggle?: (mode: "live" | "demo") => void;
}

export function PortalHeader({
  user,
  mode = "live",
  onModeToggle,
}: PortalHeaderProps) {
  const brand = getBrandConfig();
  const router = useRouter();
  const { user: sessionUser, logout } = useAuth();
  const { currency, formatMoney } = useCurrency();
  const pathname = usePathname() ?? "";
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = sessionUser ?? user;
  const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || "Trader";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand logo & portal title */}
        <div className="flex items-center gap-4">
          <Link href="/" title="Return to Main Site" className="flex items-center gap-2">
            <BrandLogo />
            <span className="hidden rounded-full border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-primary sm:inline-block">
              Trader Portal
            </span>
          </Link>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          <Link href="/" className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-brand-secondary transition-colors hover:bg-white/10 hover:text-white sm:flex">
            ← Main Site
          </Link>

          {/* Notifications bell */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-secondary transition-colors hover:bg-white/10 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl border border-white/10 bg-brand-surface p-4 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Notifications</h4>
                  <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
                    3 New
                  </span>
                </div>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/5">
                    <p className="font-semibold text-white">Execution Filled</p>
                    <p className="text-[11px] text-brand-secondary">BUY 0.5 BTC filled at {formatMoney(64120.5)} (50x leverage)</p>
                    <span className="text-[10px] text-brand-primary">12 mins ago</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/5">
                    <p className="font-semibold text-emerald-400">Daily Staking Reward</p>
                    <p className="text-[11px] text-brand-secondary">+112.50 USDT accrued from Tether Dollar Pool</p>
                    <span className="text-[10px] text-brand-secondary">4 hours ago</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 transition-colors hover:bg-white/5">
                    <p className="font-semibold text-white">Tier 2 KYC Verified</p>
                    <p className="text-[11px] text-brand-secondary">Daily withdrawal limit raised to {formatMoney(100000)}</p>
                    <span className="text-[10px] text-brand-secondary">Yesterday</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-1.5 pr-2.5 text-xs text-white transition-colors hover:bg-white/10"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary/20 to-transparent border border-brand-primary/40 font-bold text-brand-primary">
                {fullName.slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden max-w-[100px] truncate font-semibold sm:inline">{fullName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-brand-secondary" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/10 bg-brand-surface p-3 shadow-2xl backdrop-blur-xl animate-in fade-in duration-150">
                {/* User card snippet */}
                <div className="border-b border-white/10 pb-3 pt-1 px-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{fullName}</span>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-primary/10 px-1.5 py-0.2 text-[9px] font-bold text-brand-primary">
                      <ShieldCheck className="h-2.5 w-2.5" /> KYC Tier 2
                    </span>
                  </div>
                  <p className="text-xs text-brand-secondary truncate mt-0.5">{currentUser.email}</p>
                </div>

                {/* Dropdown Menu Items */}
                <div className="mt-2 space-y-1 text-xs">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-brand-secondary transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Settings className="h-4 w-4 text-brand-primary" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href="/dashboard/settings?tab=security"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-brand-secondary transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>Security & Password</span>
                  </Link>

                  <Link
                    href="/dashboard/portfolio"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-brand-secondary transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <User className="h-4 w-4 text-blue-400" />
                    <span>Portfolio & Holdings</span>
                  </Link>

                  <Link
                    href="/contacts"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-brand-secondary transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <HelpCircle className="h-4 w-4 text-purple-400" />
                    <span>24/7 VIP Support</span>
                  </Link>

                  <div className="border-t border-white/10 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-rose-400 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
