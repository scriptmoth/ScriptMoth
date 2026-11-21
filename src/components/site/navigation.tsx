"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation, themeStorageKey } from "@/lib/site";
import { Brand } from "../ui";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
    function syncTheme() {
      let preference;
      try { preference = localStorage.getItem(themeStorageKey); } catch {}
      const next = preference === "dark" || preference === "light"
        ? preference
        : systemTheme.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      setTheme(next);
    }
    syncTheme();
    systemTheme.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      systemTheme.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem(themeStorageKey, next); } catch {}
  }

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <span className="tooltip">
      <button type="button" className="icon-button" onClick={toggleTheme} aria-label={label}>
        {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
      </button>
      <span className="tooltip-label" aria-hidden="true">{label}</span>
    </span>
  );
}

function NavLinks({ pathname, close }: { pathname: string; close?: () => void }) {
  return navigation.map(({ href, label }) => {
    const current = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link key={href} href={href} onClick={close} aria-current={current ? "page" : undefined}>
        {label}
      </Link>
    );
  });
}

function Navigation({ pathname }: { pathname: string }) {
  const [expanded, setExpanded] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header className="site-header" onKeyDown={(event) => {
      if (event.key === "Escape" && expanded) {
        setExpanded(false);
        menuButton.current?.focus();
      }
    }}>
      <div className="site-container header-row">
        <Brand eager onClick={() => setExpanded(false)} />
        <nav className="desktop-nav" aria-label="Main"><NavLinks pathname={pathname} /></nav>
        <div className="header-controls">
          <ThemeToggle />
          <button type="button" className="icon-button mobile-toggle" ref={menuButton}
            aria-label={expanded ? "Close menu" : "Open menu"} aria-expanded={expanded}
            aria-controls="mobile-navigation" onClick={() => setExpanded(!expanded)}>
            {expanded ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav className="mobile-nav" id="mobile-navigation" aria-label="Main" hidden={!expanded}>
        <div className="site-container"><NavLinks pathname={pathname} close={() => setExpanded(false)} /></div>
      </nav>
    </header>
  );
}

// A new route starts with its mobile menu closed, including navigation with the browser Back button.
export function Header() {
  const path = usePathname();
  return <Navigation key={path} pathname={path} />;
}
