import { auth, authConfigured } from "@/lib/business/auth";

async function handle(request: Request) {
  if (!authConfigured()) return Response.json({ message: "Accounts are unavailable." }, { status: 503 });
  return (await auth()).handler(request);
}
export { handle as GET, handle as POST };
