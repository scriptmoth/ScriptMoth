import { notFound, redirect } from "next/navigation";
import { builderRoutes } from "@/data/builder";

export default async function BuildRoute({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!Object.hasOwn(builderRoutes, type)) notFound();
  redirect(`/contact?type=${builderRoutes[type as keyof typeof builderRoutes]}`);
}
