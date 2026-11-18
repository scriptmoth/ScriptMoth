import type { ReactNode } from "react";
import { ActionForm } from "./forms";
import { clientAction } from "@/app/dashboard/actions";

export function ClientForm({ intent, id, title, children, submit, icon }: {
  intent: string; id?: string; title: string; children?: ReactNode; submit?: string; icon?: ReactNode;
}) {
  return <ActionForm title={title} action={clientAction} submit={submit} icon={icon}>
    <input type="hidden" name="intent" value={intent} />
    <input type="hidden" name="id" value={id ?? ""} />
    {children}
  </ActionForm>;
}
export function AttachmentField() {
  return <label className="field">Attachments (up to four, 4 MB combined)<input type="file" name="attachments" multiple accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.docx,.zip" /></label>;
}
