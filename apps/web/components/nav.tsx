"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ExternalLink, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

const exampleLinks = [
  { label: "Auth Flow", href: "/login" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
  { label: "Wizard", href: "/wizard" },
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Compare", href: "/compare" },
  { label: "Quality", href: "/quality" },
];

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const isExampleActive = exampleLinks.some((link) => isActive(link.href));

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 md:px-6">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="mr-3 flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            shadcn/ai
            <Badge variant="secondary" className="text-[10px]">
              starter
            </Badge>
          </Link>

          <Separator orientation="vertical" className="mx-1 hidden h-4 md:block" />

          {/* Desktop links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Examples dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExamplesOpen(!examplesOpen)}
                onBlur={() => setTimeout(() => setExamplesOpen(false), 150)}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  isExampleActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Examples
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    examplesOpen && "rotate-180"
                  )}
                />
              </button>
              {examplesOpen && (
                <div className="absolute left-0 top-full mt-1 min-w-[160px] rounded-lg border border-border bg-popover p-1 shadow-md">
                  {exampleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setExamplesOpen(false)}
                      className={cn(
                        "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                        isActive(link.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: GitHub + Mobile toggle */}
        <div className="flex items-center gap-1">
          <a
            href="https://github.com/liamreckziegel/shadcn-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:flex"
          >
            GitHub
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm transition-colors",
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            <Separator className="my-1" />

            <p className="px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Examples
            </p>
            {exampleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-md px-2.5 py-2 pl-4 text-sm transition-colors",
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

            <Separator className="my-1" />

            <a
              href="https://github.com/liamreckziegel/shadcn-ai"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
