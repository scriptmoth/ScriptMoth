import { TicketWorkspace } from "@/components/business/ticket-workspace";
import { requireAdmin } from "@/lib/business/auth";

export const metadata = { title: "Manage Support Ticket", robots: { index: false } };
export default async function SupportAdmin({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  return <TicketWorkspace id={(await params).id} actor={actor} admin />;
}
