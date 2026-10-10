"use client";

import { useEffect, useState } from "react";

type PuzzleCaptchaProps = {
  onSolved: (challengeId: string, answer: number) => void;
};

export function PuzzleCaptcha({ onSolved }: PuzzleCaptchaProps) {
  const [challenge, setChallenge] = useState<{ id: string; target: number } | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    fetch("/api/auth/challenge", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { id: string; target: number }) => setChallenge(data))
      .catch(() => setChallenge(null));
  }, []);

  useEffect(() => {
    if (challenge && Math.abs(value - challenge.target) <= 1) {
      onSolved(challenge.id, challenge.target);
    }
  }, [challenge, onSolved, value]);

  return (
    <div className="rounded-brand bg-brand-surface p-4 shadow-border">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium">Human verification</span>
        <span className="text-brand-secondary">{challenge ? `Fit the piece at ${challenge.target}` : "Loading..."}</span>
      </div>
      <div className="relative h-12 rounded-brand bg-brand-background/70">
        {challenge ? <div className="absolute top-2 h-8 w-8 rounded-[calc(var(--radius-brand)-2px)] bg-brand-primary/25 shadow-border" style={{ left: `calc(${challenge.target}% - 16px)` }} /> : null}
        <div className="absolute top-2 h-8 w-8 rounded-[calc(var(--radius-brand)-2px)] bg-brand-primary" style={{ left: `calc(${value}% - 16px)` }} />
      </div>
      <input
        aria-label="Drag puzzle piece"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-4 w-full accent-[rgb(var(--color-primary))]"
      />
    </div>
  );
}
