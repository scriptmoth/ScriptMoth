import { viewer } from "@/lib/business/auth";
import { authorizedFile, verifyFileUrl } from "@/lib/business/files";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await viewer();
  const { id } = await params;
  const search = new URL(request.url).searchParams;
  if (!actor || !verifyFileUrl(id, actor, search.get("expiry") ?? "", search.get("signature") ?? "")) return new Response(null, { status: 404 });
  const file = authorizedFile(id, actor);
  if (!file) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(file.bytes), { headers: {
    "Content-Type": file.content_type,
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename).replace(/[!'()*]/g, char => "%" + char.charCodeAt(0).toString(16))}`,
    "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
  } });
}
