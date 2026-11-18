import { betterAuth } from "better-auth";
import { getMigrations } from "better-auth/db/migration";
import { emailOTP } from "better-auth/plugins";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { databaseConfigured, db, one } from "./db";
import type { Actor } from "./files";
import { emailConfigured, sendEmail } from "./notify";

export function origin() {
  const value = process.env.BETTER_AUTH_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  try {
    const url = new URL(value);
    return value && (url.protocol === "https:" || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) ? url.origin : "";
  } catch {
    return "";
  }
}
export const authConfigured = () => databaseConfigured() && Boolean(origin() && (process.env.BETTER_AUTH_SECRET?.length ?? 0) >= 32) && emailConfigured();
const createAuth = () => betterAuth({
  appName: "Scriptmoth",
  baseURL: origin(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: db(),
  advanced: { useSecureCookies: origin().startsWith("https:") },
  session: { expiresIn: 60 * 60 * 24 * 7 },
  rateLimit: {
    enabled: true, storage: "database",
    customRules: { "/email-otp/send-verification-otp": { window: 60, max: 3 } },
  },
  plugins: [emailOTP({
    otpLength: 8, storeOTP: "hashed", allowedAttempts: 3,
    async sendVerificationOTP({ email, otp }) {
      await sendEmail(email, "Your Scriptmoth sign-in code", `Your sign-in code is ${otp}. It expires in five minutes.`);
    },
  })],
});
let ready: Promise<ReturnType<typeof createAuth>> | undefined;
export function auth() {
  if (!ready) ready = (async () => {
    const instance = createAuth();
    const migration = await getMigrations(instance.options);
    await migration.runMigrations();
    return instance;
  })().catch(error => {
    ready = undefined;
    throw error;
  });
  return ready;
}
export async function viewer(): Promise<Actor | null> {
  const requestHeaders = await headers();
  if (!authConfigured()) return null;
  const instance = await auth();
  const session = await instance.api.getSession({ headers: requestHeaders });
  if (!session?.user.emailVerified) return null;
  const user = session.user;
  if (one<{ enabled: number }>("SELECT enabled FROM client_settings WHERE user_id=?", user.id)?.enabled === 0) return null;
  const admins = (process.env.SCRIPTMOTH_ADMIN_EMAILS ?? "").toLowerCase().split(",").map(email => email.trim());
  return { id: user.id, email: user.email, name: user.name, admin: admins.includes(user.email.toLowerCase()) };
}
export async function requireViewer() {
  const actor = await viewer();
  if (!actor) redirect("/login");
  return actor;
}
export async function requireAdmin() {
  const actor = await requireViewer();
  if (!actor.admin) redirect("/dashboard");
  return actor;
}
