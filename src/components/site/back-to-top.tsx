"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

/** Floating "back to top" button on every page; appears once the visitor has scrolled past the first screen. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  // Demo pages have their own floating switcher bar along the bottom edge.
  const onDemo = usePathname()?.startsWith("/demos/");

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const scrollToTop = () => {
    // Move focus back to the top of the page so keyboard users continue from there.
    const top = document.getElementById("top");
    if (top) {
      top.tabIndex = -1;
      top.focus({ preventScroll: true });
    }
    window.scrollTo({ top: 0 });
  };

  return (
    <button
      type="button"
      className="scroll-top icon-button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      data-visible={visible || undefined}
      data-demo={onDemo || undefined}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
