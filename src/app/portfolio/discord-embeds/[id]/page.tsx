import { notFound } from "next/navigation";
import { EmbedStudio } from "@/demos/discord/embed-library";
import { embedFamily, embedStyle, embedStyles } from "@/demos/discord/discord-embeds";
import { pageMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ for?: string | string[]; look?: string | string[] }>;
};

export function generateStaticParams() {
  return embedStyles.map(style => ({ id: style.id.toLowerCase() }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const style = embedStyle(id);
  if (!style) return {};
  const group = embedFamily(style.family);
  return pageMetadata(
    `${style.id} ${style.name} · Discord embed`,
    `${style.name}, a ${group?.title.toLowerCase()} Discord embed design. Preview it as rules, welcome, FAQ, or roles, and copy the text or webhook JSON.`,
    `/portfolio/discord-embeds/${style.id.toLowerCase()}`,
  );
}

export default async function EmbedDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const style = embedStyle(id);
  if (!style) notFound();
  const query = await searchParams;
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return (
    <section className="section" aria-labelledby="embed-title">
      <div className="site-container">
        <EmbedStudio key={style.id} id={style.id} initialPurpose={first(query.for)} initialLook={first(query.look)} />
      </div>
    </section>
  );
}
