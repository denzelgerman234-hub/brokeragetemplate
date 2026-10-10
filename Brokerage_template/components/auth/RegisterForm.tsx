"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PuzzleCaptcha } from "@/components/auth/PuzzleCaptcha";

export function RegisterForm() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<{ id: string; answer: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
        challengeId: challenge?.id ?? "",
        challengeAnswer: challenge?.answer ?? -1,
      }),
    });
    const data = (await response.json().catch(() => null)) as { errors?: Record<string, string[]> } | null;
    setLoading(false);
    if (!response.ok) {
      setError(data?.errors ? Object.values(data.errors).flat()[0] ?? "Unable to create account." : "Unable to create account.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form action={submit} className="rounded-[calc(var(--radius-brand)+10px)] bg-brand-surface p-2 shadow-border">
      <div className="grid gap-4 rounded-brand bg-brand-background/45 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="firstName" label="First name" />
          <Field name="lastName" label="Last name" />
        </div>
        <Field name="email" label="Email address" type="email" />
        <Field name="password" label="Password" type="password" />
        <PuzzleCaptcha onSolved={(id, answer) => setChallenge({ id, answer })} />
        {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
        <label className="flex items-start gap-3 text-sm text-brand-secondary">
          <input type="checkbox" required className="mt-1" />I confirm that I have read the risk warning and agree to the account terms.
        </label>
        <button disabled={loading || !challenge} type="submit" className="rounded-brand bg-brand-primary px-4 py-3 text-sm font-semibold text-black transition-[opacity,scale] duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

function Field({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input name={name} type={type} required className="min-h-11 rounded-brand border border-white/10 bg-brand-surface px-4 text-sm outline-none transition-[border-color] duration-150 focus:border-brand-primary" />
    </label>
  );
}
