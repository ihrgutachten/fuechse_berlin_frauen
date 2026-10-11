"use client";

import { createElement, useEffect } from "react";
import { LEOTICKET_SCRIPT_SRC } from "@/lib/tickets";

export function LeoticketEvents() {
  useEffect(() => {
    if (document.querySelector(`script[src="${LEOTICKET_SCRIPT_SRC}"]`)) return;
    const script = document.createElement("script");
    script.type = "module";
    script.src = LEOTICKET_SCRIPT_SRC;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-48 overflow-hidden rounded-[var(--fb-radius-lg)] bg-white">
      {createElement("leoticket-events")}
    </div>
  );
}
