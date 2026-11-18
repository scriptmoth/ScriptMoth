"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { assets } from "@/lib/assets";
import { Art } from "./ui";

const storageKey = "scriptmoth-moth-companion";
const listeners = new Set<() => void>();
let memory = false;

function readEnabled() {
  try { return localStorage.getItem(storageKey) === "on"; } catch { return memory; }
}
function setEnabled(on: boolean) {
  memory = on;
  try { localStorage.setItem(storageKey, on ? "on" : "off"); } catch {}
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

/** A small moth that trails the mouse pointer. Off by default; CSS hides it on touch and reduced-motion devices. */
export function MothCompanion() {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => false);
  const moth = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = moth.current;
    if (!enabled || !node) return;
    let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, placed = false;

    // Ease toward the pointer and stop the loop once the moth has caught up, so an idle page does no work.
    const tick = () => {
      const dx = targetX - x, dy = targetY - y;
      x += dx * 0.12;
      y += dy * 0.12;
      const tilt = Math.max(-24, Math.min(24, dx * 0.5));
      node.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt}deg)`;
      frame = Math.abs(dx) + Math.abs(dy) > 0.4 ? requestAnimationFrame(tick) : 0;
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX + 16;
      targetY = event.clientY + 14;
      if (!placed) {
        x = targetX;
        y = targetY;
        placed = true;
      }
      node.dataset.visible = "";
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const leave = () => delete node.dataset.visible;

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  return (
    <>
      <button type="button" className="companion-toggle" aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
        <span data-box aria-hidden="true">{enabled ? "✦" : ""}</span> Moth companion
      </button>
      {enabled && <span ref={moth} className="moth-companion" aria-hidden="true"><Art artwork={assets.mark} sizes="26px" /></span>}
    </>
  );
}
