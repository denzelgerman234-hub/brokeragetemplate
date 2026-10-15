"use client";

import { useEffect, useState } from "react";

type PuzzleCaptchaProps = {
  onSolved: (challengeId: string, answer: number | null) => void;
};

export function PuzzleCaptcha({ onSolved }: PuzzleCaptchaProps) {
  const [challenge, setChallenge] = useState<{ id: string; question: string } | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    fetch("/api/auth/challenge", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { id: string; question: string }) => setChallenge(data))
      .catch(() => setChallenge(null));
  }, []);

  useEffect(() => {
    const answer = Number(value);
    if (challenge) onSolved(challenge.id, Number.isInteger(answer) && value.trim() !== "" ? answer : null);
  }, [challenge, onSolved, value]);

  return (
    <div className="rounded-brand border border-brand-primary/15 bg-brand-surface p-4 shadow-border">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Human verification</span>
        <span className="text-brand-secondary">{challenge ? "Solve the quick math check" : "Loading..."}</span>
      </div>
      <div className="flex items-center gap-3 rounded-brand bg-brand-background/70 p-3">
        <span className="rounded-[calc(var(--radius-brand)-2px)] bg-brand-primary/15 px-3 py-2 font-mono text-lg font-semibold text-brand-primary">
          {challenge ? `${challenge.question} =` : "…"}
        </span>
        <input
        aria-label="Math answer"
        inputMode="numeric"
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Answer"
        disabled={!challenge}
        className="min-h-10 w-full rounded-brand border border-white/10 bg-brand-surface px-3 text-sm text-brand-text outline-none transition-colors placeholder:text-brand-secondary/70 focus:border-brand-primary disabled:opacity-50"
      />
      </div>
    </div>
  );
}
