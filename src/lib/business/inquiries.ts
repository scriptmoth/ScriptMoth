import { createHash, randomUUID } from "node:crypto";
import { availability, quoteSelection, setting } from "./catalog";
import { calculateBuild } from "./builder";
import { parseSelections, type Selection } from "./pricing";
import { audit, db, one, run, takeLimit, transaction } from "./db";
import { readUploads, storeUploads, type Actor } from "./files";
import { enqueue } from "./notify";
import { parseShowcaseIds } from "@/lib/showcase-codes";
import { dateValue, hostingModes, isEmail, list, textValue, webUrl, type ProjectType, type HostingMode } from "./rules";

export type InquiryData = {
  name: string; email: string; type: string; product: string; project_name: string; description: string;
  features: string; budget: string; deadline: string; hosting: string; existing: string; discord: string;
  references: string; showcase_ids?: string[]; showcase_notes?: string; selected: string[]; configuration?: Selection[]; hosting_mode?: HostingMode; hosting_provider?: string;
};
export type InquiryRow = { id: string; owner_id: string | null; email: string; status: string; data: string; estimate: string; created_at: string };

export async function saveInquiry(form: FormData, actor: Actor | null, draft: boolean, identity: string) {
  if (form.get("website_url")) throw new Error("The submission could not be accepted.");
  if (!draft && (availability() === "Closed" || setting("maintenance") === "yes")) throw new Error("New project inquiries are currently closed.");
  if (draft && !actor) throw new Error("Sign in to save a draft.");
  const reference = textValue(form, "reference", 40);
  const key = createHash("sha256").update(actor?.id ?? identity).digest("hex");
  // Unidentified guests share one bucket when SCRIPTMOTH_TRUSTED_IP_HEADER is unset; keep that limit tight.
  if (!takeLimit(`inquiry:${key}`, !actor && identity === "guest" ? 30 : 12, 3600)) throw new Error("Too many attempts. Try again in an hour.");
  const rawType = textValue(form, "type", 100, true);
  const selection = quoteSelection(rawType);
  if (!selection.type) throw new Error("Choose a project type.");
  const type = selection.type as ProjectType;
  const product = textValue(form, "product", 100) || selection.product?.slug || selection.plan?.id || "";
  const encoded = textValue(form, "configuration", 120000);
  const configuration = encoded ? parseSelections(encoded) : undefined;
  if (!configuration) throw new Error("Configure your project before saving or submitting.");
  const email = actor?.email ?? textValue(form, "email", 254, !draft).toLowerCase();
  if (email && !isEmail(email)) throw new Error("Enter a valid email address.");
  if (!actor && !takeLimit(`inquiry-email:${createHash("sha256").update(email).digest("hex")}`, 5, 3600)) throw new Error("Too many attempts. Try again in an hour.");
  const hostingMode = textValue(form, "hosting_mode", 20) || "unsure";
  if (!Object.hasOwn(hostingModes, hostingMode)) throw new Error("Choose a hosting preference.");
  const hostingProvider = textValue(form, "hosting_provider", 400, !draft && hostingMode === "client");
  if (hostingMode !== "managed" && (quoteSelection(product).plan || configuration.some(item => item.id.startsWith("plan:") || item.id.endsWith(":managed-hosting")))) {
    throw new Error("Choose Scriptmoth-managed hosting to add a management plan.");
  }
  const data: InquiryData = {
    name: textValue(form, "name", 100, !draft), email, type, product,
    project_name: textValue(form, "project_name", 150, !draft),
    description: textValue(form, "description", 5000, !draft),
    features: textValue(form, "features", 2500), budget: textValue(form, "budget", 120),
    deadline: dateValue(textValue(form, "deadline", 10)) ?? "",
    hosting: textValue(form, "hosting", 120), existing: textValue(form, "existing", 1500),
    discord: textValue(form, "discord", 100), references: list(textValue(form, "references", 2000)).map(webUrl).join("\n"),
    showcase_ids: parseShowcaseIds(textValue(form, "showcase_ids", 400)), showcase_notes: textValue(form, "showcase_notes", 1500),
    selected: configuration.map(item => item.id), configuration,
    hosting_mode: hostingMode as HostingMode, hosting_provider: hostingProvider,
  };
  const price = calculateBuild(type, configuration, product);
  if (price.issues.length && !draft) throw new Error(price.issues[0].message);
  if (!draft && price.pricingVersion !== form.get("pricing_version")) {
    throw new Error("Prices updated while you were building. Refresh the page, review the new estimate, and save your build link if needed.");
  }
  const uploads = await readUploads(form);
  const id = reference || `SM-${randomUUID()}`;
  return transaction(db(), () => {
    if (reference) {
      if (!actor || !one("SELECT id FROM inquiries WHERE id=? AND owner_id=? AND status='draft'", id, actor.id)) throw new Error("This draft is unavailable.");
      run("UPDATE inquiries SET email=?,status=?,data=?,estimate=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
        email, draft ? "draft" : "new", JSON.stringify(data), JSON.stringify(price), id);
    } else {
      run("INSERT INTO inquiries (id,owner_id,email,status,data,estimate) VALUES (?,?,?,?,?,?)",
        id, actor?.id ?? null, email, draft ? "draft" : "new", JSON.stringify(data), JSON.stringify(price));
    }
    storeUploads(uploads, { inquiry: id }, actor);
    audit(actor?.id ?? null, draft ? "inquiry.draft" : "inquiry.submitted", id);
    if (!draft) {
      enqueue(`inquiry:${id}`, email, "inquiry", id);
      enqueue(`admin-inquiry:${id}`, process.env.SCRIPTMOTH_INQUIRY_EMAIL ?? "", "admin_inquiry", id);
    }
    return id;
  });
}
