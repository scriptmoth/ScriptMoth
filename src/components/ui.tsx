import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { assets, type Artwork } from "@/lib/assets";

type Variant = "primary" | "secondary" | "outline" | "destructive";

function buttonStyle(variant: Variant): CSSProperties | undefined {
  if (variant === "outline" || variant === "destructive") return undefined;
  const skins = { primary: assets.buttons.lavender, secondary: assets.buttons.cream };
  return { "--button-art": `url("${skins[variant]}")` } as CSSProperties;
}

export function ButtonLink({ href, children, variant = "primary", arrow = true }: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={`button button--${variant}`} style={buttonStyle(variant)}>
      {children}{arrow && <ArrowRight size={17} aria-hidden="true" />}
    </Link>
  );
}

export function Button({ children, type = "button", disabled, busy, onClick, variant = "primary" }: {
  children: ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  busy?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: Variant;
}) {
  return (
    <button type={type} className={`button button--${variant}`} style={buttonStyle(variant)}
      onClick={onClick} disabled={disabled || busy} aria-busy={busy || undefined}>
      {busy && <span className="spinner" aria-hidden="true" />}{children}
    </button>
  );
}

export function Art({ artwork, alt = "", className, sizes, eager }: {
  artwork: Artwork;
  alt?: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
}) {
  return <Image {...artwork} alt={alt} className={className} sizes={sizes} loading={eager ? "eager" : undefined} />;
}

export function Divider() {
  return <div className="divider" aria-hidden="true"><span>✦</span></div>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}

export function Window({ label, children, className = "" }: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`window ${className}`}>
      <div className="window-bar">
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

export function PageIntro({ eyebrow, title, children, artwork, tone = "night" }: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  artwork?: Artwork;
  tone?: "night" | "lavender" | "cream" | "plain";
}) {
  return (
    <header className="page-intro" data-tone={tone}>
      <div className="site-container intro-inner">
        <div>
          <p className="eyebrow"><span aria-hidden="true">✦</span> {eyebrow}</p>
          <h1>{title}</h1>
          <p>{children}</p>
        </div>
        {artwork && (
          <div className="intro-art">
            <Art artwork={artwork} sizes="(max-width: 600px) 80px, 170px" />
            {artwork.src === assets.hosting.src && <span className="server-lights" aria-hidden="true" />}
          </div>
        )}
      </div>
    </header>
  );
}

export function SectionHeading({ eyebrow, title, id, children }: {
  eyebrow: string;
  title: string;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow"><span aria-hidden="true">✦</span> {eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ title, children, artwork = assets.faq }: {
  title: string;
  children: ReactNode;
  artwork?: Artwork;
}) {
  return (
    <div className="empty-state">
      <Art artwork={artwork} sizes="92px" />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="empty-state" role="status">
      <Art artwork={assets.coding} sizes="92px" />
      <p><span className="spinner" aria-hidden="true" /> {label}</p>
    </div>
  );
}

