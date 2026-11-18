import { ProjectWorkspace } from "@/components/business/project-workspace";
import { requireAdmin } from "@/lib/business/auth";

export const metadata = { title: "Manage Project", robots: { index: false } };
export default async function ProjectAdmin({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  return <ProjectWorkspace id={(await params).id} actor={actor} admin />;
}
