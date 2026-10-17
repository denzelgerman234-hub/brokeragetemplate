"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

type Item = {
  id: string;
  kind: string;
  method: string;
  asset: string;
  amount: number;
  reference: string;
  proofPath?: string;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
};

function CopyText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy to clipboard"
      className="inline-flex items-center gap-1 text-[11px] text-brand-secondary hover:text-white transition"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

export function FundingQueue() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/payment-requests", { cache: "no-store" });
    if (response.ok) setItems(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    await fetch(`/api/admin/payment-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void load();
  }

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-brand-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Funding & Withdrawal Approvals</h2>
          <p className="mt-1 text-xs text-brand-secondary">
            Review user deposit proofs, plan purchases, and dispatch capital for user withdrawal requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-brand-secondary hover:bg-white/5 hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="mt-5 divide-y divide-white/10">
        {items.map((item) => {
          const isWithdrawal = item.kind === "WITHDRAWAL";
          const isDeposit = item.kind === "DEPOSIT";

          return (
            <div key={item.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isWithdrawal
                        ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                        : isDeposit
                        ? "bg-emerald-400/15 text-emerald-300 border border-emerald-400/30"
                        : "bg-blue-400/15 text-blue-300 border border-blue-400/30"
                    }`}
                  >
                    {item.kind}
                  </span>
                  <p className="font-semibold text-white">
                    {item.user.firstName} {item.user.lastName}
                    <span className="text-brand-secondary font-normal ml-1.5">({item.user.email})</span>
                  </p>
                  <span className="text-[11px] text-brand-secondary">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-white">
                  <span className="text-brand-secondary">Amount:</span>{" "}
                  <span className="font-mono font-bold text-brand-primary">
                    ${item.amount.toLocaleString()}{" "}
                  </span>
                  <span className="text-brand-secondary">via {item.method} ({item.asset})</span>
                </p>

                {isWithdrawal ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] p-2 text-xs">
                    <span className="font-semibold text-amber-200">Payout destination:</span>
                    <span className="font-mono text-white break-all">{item.reference || "Not specified"}</span>
                    {item.reference && <CopyText text={item.reference} />}
                  </div>
                ) : (
                  <p className="text-xs text-brand-secondary">
                    Reference / TX: <span className="font-mono text-white">{item.reference || "Not supplied"}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.proofPath && (
                  <>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`/api/admin/media/payment/${item.id}?inline=1`}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10 text-white"
                    >
                      View Proof
                    </a>
                    <a
                      href={`/api/admin/media/payment/${item.id}`}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10 text-white"
                    >
                      Download
                    </a>
                  </>
                )}

                {item.status === "PENDING" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => review(item.id, "APPROVED")}
                      className="rounded-lg bg-brand-primary px-3.5 py-2 text-xs font-semibold text-black hover:brightness-110 active:scale-95"
                    >
                      {isWithdrawal ? "Approve Payout" : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => review(item.id, "REJECTED")}
                      className="rounded-lg bg-rose-500/80 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-500 active:scale-95"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      item.status === "APPROVED"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {!loading && !items.length && (
          <p className="py-8 text-center text-sm text-brand-secondary">No pending approvals at this time.</p>
        )}
      </div>
    </section>
  );
}
