"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { emailOTPClient } from "better-auth/client/plugins";
import { useState, type FormEvent } from "react";
import { LogIn, LogOut, Mail, RotateCcw } from "lucide-react";
import { Button, Window } from "@/components/ui";

const client = createAuthClient({ plugins: [emailOTPClient()] });

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      if (sent) {
        const result = await client.signIn.emailOtp({ email, otp: String(form.get("code")), name: String(form.get("name") || "") || undefined });
        if (result.error) setError("The code is invalid or expired. Request a new code and try again.");
        else { router.replace("/dashboard"); router.refresh(); }
      } else {
        const result = await client.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
        if (result.error) setError("The code could not be sent. Check your email address and try again shortly.");
        else setSent(true);
      }
    } catch {
      setError("The account service is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return <Window label="Sign in">
    <form className="inquiry-form business-stack" onSubmit={submit}>
      <label className="field">Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required readOnly={sent} maxLength={254} /></label>
      {sent && <>
        <p>Enter the eight-digit code sent to your email.</p>
        <label className="field">Sign-in code<input name="code" inputMode="numeric" pattern="[0-9]{8}" autoComplete="one-time-code" required maxLength={8} /></label>
        <label className="field">Preferred name (optional for new accounts)<input name="name" maxLength={100} autoComplete="name" /></label>
      </>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="button-row">
        <Button type="submit" busy={busy}>{sent ? <><LogIn size={17} aria-hidden="true" />Sign in</> : <><Mail size={17} aria-hidden="true" />Email a sign-in code</>}</Button>
        {sent && <Button onClick={() => { setSent(false); setError(""); }} variant="outline" disabled={busy}><RotateCcw size={17} aria-hidden="true" />Use a different email</Button>}
      </div>
    </form>
  </Window>;
}
export function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return <div><Button variant="outline" busy={busy} onClick={async () => {
    setBusy(true);
    setFailed(false);
    try {
      const result = await client.signOut();
      if (result.error) throw result.error;
      router.replace("/login");
      router.refresh();
    } catch {
      setBusy(false);
      setFailed(true);
    }
  }}><LogOut size={17} aria-hidden="true" />Sign out</Button>{failed && <p role="alert">Sign-out failed. Try again.</p>}</div>;
}
