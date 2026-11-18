import { redirect } from "next/navigation";
import { AuthForm } from "@/components/business/auth-form";
import { ButtonLink, PageIntro } from "@/components/ui";
import { authConfigured, viewer } from "@/lib/business/auth";
import { assets } from "@/lib/assets";

export const metadata = { title: "Client Login", robots: { index: false } };

export default async function Login() {
  if (await viewer()) redirect("/dashboard");
  return <>
    <PageIntro eyebrow="Client portal" title="Sign in to Scriptmoth" artwork={assets.mark} tone="plain">
      Use an email code to sign in or create an account.
    </PageIntro>
    <div className="site-container section business-narrow">
      {authConfigured() ? <AuthForm /> : <div className="info-panel">
        <div><h2>Client sign-in is unavailable</h2><p>You can still submit a project inquiry as a guest when Scriptmoth is accepting work.</p></div>
        <ButtonLink href="/contact">Build a project</ButtonLink>
      </div>}
    </div>
  </>;
}
