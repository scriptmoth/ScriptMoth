import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { money } from "@/lib/business/rules";
import { packageValue } from "@/lib/business/builder";
import type { Product } from "@/lib/business/catalog";

/** Work every package comes with, on top of its features. Mirrors the delivery terms on /products. */
export const standardWork = ["Setup and installation", "One review round", "Testing before handover", "Handover guide", "14 days of bug fixes"];

export const wholeMoney = (cents: number, currency: string) => money(cents, currency).replace(/\.00$/, "");
export const productPrice = (product: Product, currency: string) =>
  product.cents === null ? "Custom quote" : `${product.pricing === "quote" ? "From " : ""}${wholeMoney(product.cents, currency)}`;

/** The package checklist, with value and standard delivery work on the full detail page. */
export function PackageContents({ product, currency, heading: Heading = "h3", compact = false, children }: {
  product: Product;
  currency: string;
  heading?: "h2" | "h3";
  compact?: boolean;
  children?: ReactNode;
}) {
  const value = packageValue(product.slug);
  const showValue = !compact && value && product.cents !== null && value.cents >= product.cents;
  return <div className="package-contents">
    {!compact && <Heading className="package-heading">What’s included</Heading>}
    {children}
    {showValue && <p className="package-value">
      <strong>{wholeMoney(value.cents, currency)}</strong> of features if you added them one by one
    </p>}
    <ul className="package-checklist">
      {product.included.map(line => <li key={line}><Check size={16} strokeWidth={2.75} aria-hidden="true" /><span>{line}</span></li>)}
    </ul>
    {!compact && <div className="package-standard">
      <p>Every package also comes with</p>
      <ul>{standardWork.map(line => <li key={line}>{line}</li>)}</ul>
    </div>}
  </div>;
}
