"use client";

import { RotateCcw } from "lucide-react";
import { ButtonLink, EmptyState } from "@/components/ui";

export default function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="section site-container status-page">
      <h1>Something went wrong</h1>
      <EmptyState title="Try again">Try again, or return home if the page still won’t load.</EmptyState>
      <div className="button-row">
        <button className="plain-button" type="button" onClick={reset}><RotateCcw size={17} aria-hidden="true" />Try again</button>
        <ButtonLink href="/" variant="secondary">Return home</ButtonLink>
      </div>
    </div>
  );
}

