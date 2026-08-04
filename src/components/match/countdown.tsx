"use client";

import { useEffect, useState } from "react";

type Parts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getParts(target: Date): Parts {
  const diff = Math.max(0, target.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function Countdown({ startsAt }: { startsAt: string }) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const target = new Date(startsAt);
    const tick = () => setParts(getParts(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startsAt]);

  const cells = [
    { label: "Tage", value: parts?.days },
    { label: "Std", value: parts?.hours },
    { label: "Min", value: parts?.minutes },
    { label: "Sek", value: parts?.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2" aria-live="polite">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-[var(--fb-radius)] bg-[var(--fb-green-900)] px-2 py-3 text-center text-white"
        >
          <div className="font-[family-name:var(--fb-font-display)] text-2xl font-extrabold tabular-nums md:text-3xl">
            {cell.value === undefined ? "––" : String(cell.value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/60">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
