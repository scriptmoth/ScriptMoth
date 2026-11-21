"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/** Hides the studio header/footer on full-page client demos (/demos/*), so they render exactly as a client's site would. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/demos/")) return null;
  return <>{children}</>;
}
