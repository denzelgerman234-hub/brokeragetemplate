"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  subject: string;
  status: string;
  messages: Array<{ id: string; body: string; createdAt: string }>;
};

export function SupportPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState<"idle" | "loading">("idle");

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

  async function submit(formData: FormData) {
    setStatus("loading");
    await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: formData.get("subject"),
        message: formData.get("message"),
      }),
    });
    setStatus("idle");
    await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={submit} className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
        <div className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
          <h2 className="font-heading text-2xl font-semibold">Open a support ticket</h2>
          <input name="subject" required placeholder="Subject" className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
          <textarea name="message" required rows={5} placeholder="How can support help?" className="rounded-brand border border-white/10 bg-brand-surface px-4 py-3 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
          <button disabled={status === "loading"} type="submit" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-50">
            {status === "loading" ? "Sending..." : "Create ticket"}
          </button>
        </div>
      </form>
      <div className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
        <div className="space-y-3 rounded-brand bg-brand-background/45 p-5">
          <h2 className="font-heading text-2xl font-semibold">Support threads</h2>
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-brand bg-brand-surface p-4 shadow-border">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{ticket.subject}</p>
                <span className="text-xs uppercase tracking-[0.14em] text-brand-secondary">{ticket.status}</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-brand-secondary">
                {ticket.messages.map((message) => (
                  <p key={message.id}>{message.body}</p>
                ))}
              </div>
            </div>
          ))}
          {tickets.length ? null : <p className="text-sm text-brand-secondary">No support tickets yet.</p>}
        </div>
      </div>
    </div>
  );
}
