"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => {};
}

/**
 * Liefert window.location.origin auf dem Client, "" beim Server-Render.
 * useSyncExternalStore vermeidet setState-im-Effect und Hydration-Mismatches.
 */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => "",
  );
}
