import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Art, Brand } from "./ui";
import { MothCompanion } from "./moth-companion";
import { assets } from "@/lib/assets";
import { navigation } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p>Websites, Discord bots, server setup, and roleplay tools.</p>
            <div className="footer-extras">
              <span className="footer-status"><span className="footer-status-light" aria-hidden="true" /> moth.exe · made by hand</span>
              <span className="web-badge" aria-hidden="true"><span>✦ moth</span><span>handmade</span></span>
              <MothCompanion />
            </div>
          </div>
          <nav aria-label="Footer">
            {navigation.filter(({ href }) => href !== "/").map(({ href, label }) =>
              <Link key={href} href={href}>{label}</Link>
            )}
            <Link href="/dashboard">Client portal</Link>
            <Link href="/policies">Policies</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Scriptmoth</span>
          <details className="footer-egg">
            <summary aria-label="Secret workshop note"><span aria-hidden="true">✦</span></summary>
            <p><span aria-hidden="true">&gt; </span> The moth reviewed this site. It approved the lighting.</p>
          </details>
          <a className="back-to-top" href="#top"><Art artwork={assets.moon} sizes="21px" /> Back to top <ArrowUp size={15} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
