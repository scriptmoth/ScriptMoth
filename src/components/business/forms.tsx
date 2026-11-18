"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { Button, Window } from "@/components/ui";

export type ActionResult = { error?: string; message?: string };
export type FormAction = (previous: ActionResult, form: FormData) => Promise<ActionResult>;

export function Submit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" busy={pending}>{children}</Button>;
}
export function ActionForm({ title, action, children, submit = "Save", icon }: {
  title: string; action: FormAction; children: ReactNode; submit?: string; icon?: ReactNode;
}) {
  const [state, dispatch] = useActionState(action, {});
  const glyph = icon ?? (submit === "Save" ? <Save size={17} aria-hidden="true" /> : null);
  return <Window label={title}><form action={dispatch} className="inquiry-form business-stack">
    {children}
    <div><Submit>{glyph}{submit}</Submit></div>
    {state.error && <p role="alert" className="field-error">{state.error}</p>}
    {state.message && <p role="status">{state.message}</p>}
  </form></Window>;
}
export function Field({ label, name, value, required, type = "text", large, max, options }: {
  label: string; name: string; value?: string | number | null; required?: boolean;
  type?: string; large?: boolean; max?: number; options?: readonly (string | { id: string; title: string })[];
}) {
  return <label className="field">{label}
    {options ? <select name={name} defaultValue={value ?? ""} required={required}>
      {!required && <option value="">Choose an option</option>}
      {options.map(option => typeof option === "string" ? <option key={option}>{option}</option> : <option key={option.id} value={option.id}>{option.title}</option>)}
    </select> : large ? <textarea rows={4} name={name} maxLength={max} required={required} defaultValue={value ?? ""} />
      : <input name={name} type={type} maxLength={max} required={required} defaultValue={value ?? ""} />}
  </label>;
}
