"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileCheck2, Inbox, LayoutDashboard, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Verification",
    items: [{ label: "KYC queue", href: "/admin/kyc", icon: FileCheck2 }],
  },
  {
    label: "Customer care",
    items: [
      { label: "Support messages", href: "/admin/support", icon: Inbox },
      { label: "Ticket handling", href: "/admin/tickets", icon: LifeBuoy },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[calc(var(--radius-brand)+14px)] bg-brand-surface p-2 shadow-border">
          <div className="rounded-brand bg-brand-background/45 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-brand bg-brand-primary text-black">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Admin</p>
                <h1 className="font-heading text-xl font-semibold">Operations</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-brand-secondary">Review identity submissions, answer customer messages, and keep ticket follow-up moving from one clear operations area.</p>
          </div>
          <nav aria-label="Admin navigation" className="grid gap-5 p-3">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">{group.label}</p>
                <div className="grid gap-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 rounded-brand px-3 py-3 text-sm font-semibold transition-[background-color,color,scale] duration-150 active:scale-[0.98]",
                          active ? "bg-brand-primary text-black" : "text-brand-secondary hover:bg-white/5 hover:text-brand-text",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <div>{children}</div>
    </main>
  );
}
