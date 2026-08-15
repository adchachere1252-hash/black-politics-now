import { Link, useLocation } from "wouter";
import { Newspaper, Map, Headphones, Archive, Search as SearchIcon, Menu, X, Sun, Moon, Globe2, Landmark, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const NAV_ITEMS: { href: string; label: string; icon: any; external?: boolean }[] = [
  { href: "/archive", label: "Archive", icon: Archive },
  { href: "/elections", label: "Election Map", icon: Map },
  { href: "/atlas", label: "Historical Atlas", icon: Landmark },
  { href: "https://blkpoliticsnow.com", label: "News", icon: Newspaper, external: true },
  { href: "/podcast", label: "Podcast", icon: Headphones },
  { href: "/research", label: "Research Desk", icon: Sparkles },
  { href: "/world", label: "World Elections", icon: Globe2 },
];

export default function SiteHeader() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="brand-gold-glimmer font-display text-xl font-extrabold tracking-tight">
            BLACK POLITICS NOW
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, external }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            if (external) {
              return (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors no-underline text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Icon size={18} strokeWidth={2.25} className="shrink-0 text-primary" />
                  {label}
                </a>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={18} strokeWidth={2.25} className="shrink-0 text-primary" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/search"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors no-underline ${
              location === "/search" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <SearchIcon size={16} />
          </Link>
          {/* Light/Dark toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 text-muted-foreground transition-colors hover:text-foreground"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="p-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border/50 bg-background pb-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon, external }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            if (external) {
              return (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-6 py-3 text-sm font-medium no-underline text-muted-foreground"
                >
                  <Icon size={18} strokeWidth={2.25} className="shrink-0 text-primary" />
                  {label}
                </a>
              );
            }
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium no-underline ${
                  active ? "text-primary bg-primary/5" : "text-muted-foreground"
                }`}
              >
                <Icon size={18} strokeWidth={2.25} className="shrink-0 text-primary" />
                {label}
              </Link>
            );
          })}
          {/* Mobile theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-muted-foreground"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </nav>
      )}
    </header>
  );
}
