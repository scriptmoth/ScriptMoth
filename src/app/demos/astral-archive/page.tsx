import { AstralArchiveDashboard } from "@/demos/astral-archive/dashboard";
import { pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata("The Astral Archive dashboard demo", "An interactive portfolio demo of a custom Discord bot dashboard for a fictional Final Fantasy XIV Free Company.", "/demos/astral-archive"),
  robots: { index: false },
};

type Props = { searchParams: Promise<{ embed?: string }> };

export default async function AstralArchiveDemo({ searchParams }: Props) {
  const { embed } = await searchParams;
  return <AstralArchiveDashboard embedded={embed === "1"} />;
}
