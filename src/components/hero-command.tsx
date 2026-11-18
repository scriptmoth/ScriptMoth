"use client";

import { useEffect, useRef } from "react";

export function HeroCommand() {
  const command = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const key = "scriptmoth-hero-command";
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "played");
    } catch {
      return;
    }
    command.current?.setAttribute("data-type", "");
  }, []);

  return (
    <div className="hero-command" aria-hidden="true">
      <span>&gt;</span> <code><span ref={command}>npm run build</span></code><span className="command-cursor">_</span>
    </div>
  );
}
