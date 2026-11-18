import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { one, run } from "./db";
import { setting } from "./catalog";

const signatures: Record<string, { type: string; hex: string; offset?: number }> = {
  png: { type: "image/png", hex: "89504e470d0a1a0a" },
  jpg: { type: "image/jpeg", hex: "ffd8ff" },
  jpeg: { type: "image/jpeg", hex: "ffd8ff" },
  gif: { type: "image/gif", hex: "47494638" },
  webp: { type: "image/webp", hex: "57454250", offset: 8 },
  pdf: { type: "application/pdf", hex: "255044462d" },
  zip: { type: "application/zip", hex: "504b0304" },
  docx: { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", hex: "504b0304" },
};
export type Actor = { id: string; email: string; name: string; admin: boolean };
type FileParent = { project?: string; inquiry?: string; ticket?: string; entry?: string };
type StoredFile = {
  id: string; filename: string; content_type: string; bytes: Uint8Array; uploader_id: string | null;
  project_id: string | null; inquiry_id: string | null; ticket_id: string | null;
};
export async function readUploads(form: FormData, imagesOnly = false) {
  const max = Math.min(4_000_000, Math.max(100_000, Number(setting("upload_limit", "4000000")) || 4_000_000));
  const files = form.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > 4 || files.reduce((size, file) => size + file.size, 0) > max) throw new Error("Upload up to four files within the combined upload limit.");
  return Promise.all(files.map(async file => {
    const name = file.name.normalize("NFKC").split(/[\\/]/).at(-1)?.replace(/[^\p{L}\p{N}._ ()-]/gu, "_").slice(-140) || "attachment";
    const extension = name.split(".").at(-1)?.toLowerCase() ?? "";
    const format = Object.hasOwn(signatures, extension) ? signatures[extension] : undefined;
    const bytes = Buffer.from(await file.arrayBuffer());
    const marker = Buffer.from(format?.hex ?? "", "hex");
    const offset = format?.offset ?? 0;
    if (!format || !marker.equals(bytes.subarray(offset, offset + marker.length)) ||
      (extension === "webp" && bytes.toString("ascii", 0, 4) !== "RIFF") || (imagesOnly && !format.type.startsWith("image/"))) {
      throw new Error("Choose a supported file with a matching extension. Supported files include PNG, JPEG, GIF, WebP, PDF, DOCX, and ZIP.");
    }
    return { id: randomUUID(), name, type: format.type, bytes };
  }));
}
type Upload = Awaited<ReturnType<typeof readUploads>>[number];
export function storeUploads(files: Upload[], parent: FileParent, actor: Actor | null) {
  for (const file of files) {
    run(`INSERT INTO files (id,project_id,inquiry_id,ticket_id,entry_id,uploader_id,filename,content_type,bytes)
      VALUES (?,?,?,?,?,?,?,?,?)`, file.id, parent.project ?? null, parent.inquiry ?? null, parent.ticket ?? null,
    parent.entry ?? null, actor?.id ?? null, file.name, file.type, file.bytes);
  }
}
export function authorizedFile(id: string, actor: Actor, includeBytes = true) {
  return one<StoredFile>(`
    SELECT f.id,f.filename,f.content_type,f.uploader_id,f.project_id,f.inquiry_id,f.ticket_id${includeBytes ? ",f.bytes" : ""}
    FROM files f LEFT JOIN projects p ON p.id=f.project_id
    LEFT JOIN inquiries i ON i.id=f.inquiry_id LEFT JOIN tickets t ON t.id=f.ticket_id
    LEFT JOIN project_entries e ON e.id=f.entry_id
    WHERE f.id=? AND (?=1 OR (p.owner_id=? AND (e.id IS NULL OR e.kind IN ('message','update','action','delivery'))) OR i.owner_id=? OR t.owner_id=?)
  `, id, Number(actor.admin), actor.id, actor.id, actor.id);
}
function signature(id: string, user: string, expiry: number) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("File signing is unavailable.");
  return createHmac("sha256", secret).update(JSON.stringify([id, user, expiry])).digest("hex");
}
export function fileUrl(id: string, actor: Actor) {
  const expiry = Math.floor(Date.now() / 1000) + 900;
  return `/api/files/${id}?expiry=${expiry}&signature=${signature(id, actor.id, expiry)}`;
}
export function verifyFileUrl(id: string, actor: Actor, expiry: string, token: string) {
  return /^\d{10}$/.test(expiry) && /^[a-f0-9]{64}$/.test(token) &&
    Number(expiry) >= Date.now() / 1000 && Number(expiry) <= Date.now() / 1000 + 900 &&
    timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(signature(id, actor.id, Number(expiry)), "hex"));
}
