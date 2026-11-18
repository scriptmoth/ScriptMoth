import { TicketWorkspace } from "@/components/business/ticket-workspace";
import { requireViewer } from "@/lib/business/auth";

export const metadata = { title: "Support Request", robots: { index: false } };
export default async function Support({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireViewer();
  return <TicketWorkspace id={(await params).id} actor={actor} admin={false} />;
}
