import type { ReactNode } from "react";
import { ActionForm } from "./forms";
import { administer } from "@/app/admin/actions";

export function AdminForm({ intent, id, title, children, submit, icon }: {
  intent: string; id?: string; title: string; children?: ReactNode; submit?: string; icon?: ReactNode;
}) {
  return <ActionForm title={title} action={administer} submit={submit} icon={icon}>
    <input type="hidden" name="intent" value={intent} />
    <input type="hidden" name="id" value={id ?? ""} />
    {children}
  </ActionForm>;
}
