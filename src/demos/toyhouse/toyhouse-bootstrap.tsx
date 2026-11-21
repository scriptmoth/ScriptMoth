import type { ReactNode } from "react";

/** Match Toyhouse's Bootstrap layout in the preview. React handles the demo tabs locally. */
export function ToyhouseBootstrap({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="/assets/vendor/bootstrap-4.6.2.min.css" />
      {children}
    </>
  );
}
