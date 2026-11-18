import type { requireAdmin } from "@/lib/business/auth";
import type { readUploads } from "@/lib/business/files";

export type AdminGet = (key: string, max?: number, required?: boolean) => string;

export type AdminHandlerCtx = {
  form: FormData;
  get: AdminGet;
  id: string;
  reference: string;
  actor: Awaited<ReturnType<typeof requireAdmin>>;
  files: Awaited<ReturnType<typeof readUploads>>;
};

export type AdminIntentCtx = AdminHandlerCtx & { intent: string };