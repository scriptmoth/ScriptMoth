import Link from "next/link";
import { Art } from "./ui";
import { BackToTop } from "./navigation";
import { assets } from "@/lib/assets";
import { navigation } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand" aria-label="Scriptmoth home">
              <Art artwork={assets.mark} sizes="40px" />
              <span>Scriptmoth<span className="brand-cursor" aria-hidden="true">_</span></span>
            </Link>
            <p>Websites, Discord bots, server setup, and roleplay tools.</p>
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
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
