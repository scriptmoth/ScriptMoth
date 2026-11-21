import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/site/navigation";
import { Footer } from "@/components/site/footer";
import { SiteChrome } from "@/components/site/site-chrome";
import { BackToTop } from "@/components/site/back-to-top";
import { siteUrl, themeStorageKey } from "@/lib/site";
import { homeMetadata } from "@/lib/metadata";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/dm-sans";
import "@/styles/globals.css";

export const metadata: Metadata = {
  ...homeMetadata,
  title: { default: "Scriptmoth · Handmade websites & Discord bots", template: "%s | Scriptmoth" },
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : { robots: { index: false, follow: false } }),
};

// Set the saved theme before the first paint. The header keeps it in sync after hydration.
const setInitialTheme = `
  let theme;
  try { theme = localStorage.getItem(${JSON.stringify(themeStorageKey)}); } catch {}
  if (theme !== "light" && theme !== "dark") {
    theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.documentElement.dataset.theme = theme;
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `{ ${setInitialTheme} }` }} /></head>
      <body id="top" className="font-sans antialiased">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteChrome><Header /></SiteChrome>
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteChrome><Footer /></SiteChrome>
        <BackToTop />
      </body>
    </html>
  );
}
