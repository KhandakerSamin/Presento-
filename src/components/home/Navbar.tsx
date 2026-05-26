"use client";

import React from "react";
import Link from "next/link";
import { Grid2x2PlusIcon, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverButton } from "@/components/ui/HoverButton";

export default function Navbar() {
  const [open, setOpen] = React.useState(false);

  const links = [
    {
      label: "Features",
      href: "#features",
    },
    {
      label: "How It Works",
      href: "#how-it-works",
    },
    {
      label: "About",
      href: "#about",
    },
  ];

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-3">
      <div
        className={cn(
          "mx-auto w-full max-w-3xl rounded-lg border shadow",
          "bg-white/80 dark:bg-slate-950/60 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/50 backdrop-blur-lg",
          "border-slate-200/70 dark:border-slate-800"
        )}
      >
      <nav className="mx-auto flex items-center justify-between p-1.5">
        <Link
          href="/"
          className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1 duration-100"
        >
          <Grid2x2PlusIcon className="size-5" />
          <p className="font-mono text-base font-bold">Presento</p>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.label}
              className="px-3 py-1.5 text-sm rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/teacher/login">
            <HoverButton className="h-11 px-6 text-sm">Get Started</HoverButton>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            <MenuIcon className="size-4" />
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-slate-200/70 dark:border-slate-800 px-3 pb-3">
          <div className="grid gap-2 pt-3">
            {links.map((link) => (
              <a
                key={link.label}
                className="px-3 py-2 text-sm rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link href="/teacher/login" className="mt-2" onClick={() => setOpen(false)}>
              <HoverButton className="w-full h-11 text-sm">Get Started</HoverButton>
            </Link>
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
