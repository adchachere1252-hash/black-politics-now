import { Link, useLocation } from "wouter";
import { Newspaper, Map, Headphones, Archive, Search as SearchIcon, Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

const NAV_ITEMS = [
  { href: "https://blkpoliticsnow.com", label: "News", icon: Newspaper, external: true },
  { href: "/elections", label: "Election Map", icon: Map },
  { href: "/podcast", label: "Podcast", icon: Headphones },
  { href: "/archive", label: "Archive", icon: Archive },
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
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
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
                  <Icon size={16} />
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
                <Icon size={16} />
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

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
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
                  <Icon size={16} />
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
                <Icon size={16} />
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
