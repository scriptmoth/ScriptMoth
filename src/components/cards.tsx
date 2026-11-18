import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { Art } from "./ui";

export function ServiceCard({ service, detailed }: {
  service: typeof services[number];
  detailed?: boolean;
}) {
  const Heading = detailed ? "h2" : "h3";
  return (
    <article className={`service-card ${detailed ? "service-card--detailed" : "service-card--preview"}`} data-service={service.id} id={detailed ? service.id : undefined}>
      <div className="service-icon">
        <Art artwork={service.art} sizes={detailed ? "74px" : "54px"} />
      </div>
      <Heading>{service.title}</Heading>
      <p>{service.summary}</p>
      {detailed ? (
        <>
          <ul>{service.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <Link className="text-link" href={service.id === "hosting" ? "/hosting" : `/contact?type=${service.id}`}>
            {service.id === "hosting" ? "Compare hosting plans" : "Start an inquiry"} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </>
      ) : (
        <Link className="text-link card-link" href={service.id === "hosting" ? "/hosting" : `/services#${service.id}`} aria-label={`View details for ${service.title}`}>
          View details <ArrowRight size={15} aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
