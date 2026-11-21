"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The hero collage. Tracks the pointer across the whole hero and exposes it as --mx / --my (-1…1),
 * which each layer multiplies by its own depth. Fine pointers only, and never with reduced motion.
 */
export function HeroDesk({ className, children }: { className?: string; children: ReactNode }) {
  const desk = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = desk.current;
    if (!element) return;
    const area = element.closest("section") ?? element;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      element.style.setProperty("--mx", x.toFixed(3));
      element.style.setProperty("--my", y.toFixed(3));
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      const bounds = area.getBoundingClientRect();
      x = ((event.clientX - bounds.left) / bounds.width - .5) * 2;
      y = ((event.clientY - bounds.top) / bounds.height - .5) * 2;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const rest = () => {
      x = 0;
      y = 0;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    area.addEventListener("pointermove", move as EventListener);
    area.addEventListener("pointerleave", rest);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointermove", move as EventListener);
      area.removeEventListener("pointerleave", rest);
    };
  }, []);

  return <div ref={desk} className={className}>{children}</div>;
}
