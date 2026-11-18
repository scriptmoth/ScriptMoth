import { Check, CircleAlert, Server } from "lucide-react";
import { Art } from "@/components/ui";
import { assets } from "@/lib/assets";

const complete = new Set(["accepted", "completed", "paid", "resolved"]);
const attention = new Set(["on hold", "awaiting client", "awaiting client review", "awaiting approval", "awaiting deposit", "overdue"]);

export function BusinessStatus({ status }: { status: string }) {
  const value = status.toLowerCase();
  const tone = complete.has(value) ? "complete" : attention.has(value) ? "attention" : "neutral";
  return (
    <span className="business-status" data-tone={tone}>
      {tone === "complete" && <Check size={13} aria-hidden="true" />}
      {tone === "attention" && <CircleAlert size={13} aria-hidden="true" />}
      {status}
    </span>
  );
}

export function SleepingMoth({ children }: { children: string }) {
  return (
    <div className="sleeping-moth">
      <span className="sleeping-moth-art" aria-hidden="true">
        <Art artwork={assets.mark} sizes="46px" />
        <Art artwork={assets.moon} className="sleeping-moon" sizes="18px" />
      </span>
      <p>{children}</p>
    </div>
  );
}

const healthyHosting = new Set(["active", "healthy", "online", "operational"]);

export function HostingHealth({ status }: { status: string }) {
  return (
    <span className="business-status hosting-health" data-healthy={healthyHosting.has(status.trim().toLowerCase())}>
      <Server size={14} aria-hidden="true" />{status}
    </span>
  );
}
