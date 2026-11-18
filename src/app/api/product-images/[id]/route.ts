import { catalog } from "@/lib/business/catalog";
import { one } from "@/lib/business/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!catalog().some(item => item.images.includes(id))) return new Response(null, { status: 404 });
  const image = one<{ content_type: string; bytes: Uint8Array }>("SELECT content_type,bytes FROM product_images WHERE id=?", id);
  if (!image) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(image.bytes), { headers: { "Content-Type": image.content_type, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" } });
}
