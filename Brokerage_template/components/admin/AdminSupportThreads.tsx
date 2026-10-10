"use client";

import { useEffect, useState } from "react";
import { PullToRefresh } from "@/components/block/PullToRefresh";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  user: { email: string };
  messages: Array<{ id: string; body: string; createdAt: string }>;
};

export function AdminSupportThreads({ view = "messages" }: { view?: "messages" | "tickets" }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  async function load() {
    const response = await fetch("/api/support/tickets", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { tickets: Ticket[] };
      setTickets(data.tickets);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function reply(ticketId: string, formData: FormData) {
    await fetch(`/api/support/tickets/${ticketId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: formData.get("message") }),
    });
    await load();
  }

  return (
    <PullToRefresh onRefresh={load}>
      <div className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: view === "tickets" ? "Total tickets" : "Threads", value: tickets.length },
            { label: "Open", value: tickets.filter((ticket) => ticket.status !== "CLOSED").length },
            { label: "Messages", value: tickets.reduce((sum, ticket) => sum + ticket.messages.length, 0) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[calc(var(--radius-brand)+8px)] bg-brand-surface p-5 shadow-border">
              <p className="font-heading text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-brand-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
            <div className="rounded-brand bg-brand-background/45 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-xl font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-brand-secondary">{ticket.user.email}</p>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-brand-secondary">{ticket.status}</span>
              </div>
              <div className={view === "tickets" ? "mt-5 grid gap-3 md:grid-cols-[220px_1fr]" : "mt-4 space-y-2"}>
                {view === "tickets" ? (
                  <div className="rounded-brand bg-brand-surface p-4 text-sm text-brand-secondary">
                    <p className="font-semibold text-brand-text">Ticket details</p>
                    <p className="mt-3">Messages: {ticket.messages.length}</p>
                    <p className="mt-2">Status: {ticket.status}</p>
                  </div>
                ) : null}
                <div className="space-y-2">
                  {ticket.messages.map((message) => (
                    <p key={message.id} className="rounded-brand bg-brand-surface p-3 text-sm text-brand-secondary">
                      {message.body}
                    </p>
                  ))}
                </div>
              </div>
              <form action={(formData) => reply(ticket.id, formData)} className="mt-4 flex gap-2">
                <input name="message" required placeholder={view === "tickets" ? "Add ticket note" : "Reply to thread"} className="min-h-10 flex-1 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
                <button type="submit" className="rounded-brand bg-brand-primary px-4 py-2 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96]">
                  Reply
                </button>
              </form>
            </div>
          </div>
        ))}
        {tickets.length ? null : <p className="rounded-brand bg-brand-surface p-5 text-sm text-brand-secondary shadow-border">No support tickets yet.</p>}
      </div>
    </PullToRefresh>
  );
}
