import { ProjectWorkspace } from "@/components/business/project-workspace";
import { requireViewer } from "@/lib/business/auth";

export const metadata = { title: "Client Project", robots: { index: false } };
export default async function Project({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireViewer();
  return <ProjectWorkspace id={(await params).id} actor={actor} admin={false} />;
}
