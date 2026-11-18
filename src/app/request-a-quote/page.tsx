import { redirect } from "next/navigation";

export default async function RequestQuote({ searchParams }: { searchParams: Promise<{ type?: string; draft?: string }> }) {
  const query = await searchParams;
  const target = new URLSearchParams();
  if (typeof query.type === "string") target.set("type", query.type);
  if (typeof query.draft === "string") target.set("draft", query.draft);
  redirect(target.size ? `/contact?${target}` : "/contact");
}
