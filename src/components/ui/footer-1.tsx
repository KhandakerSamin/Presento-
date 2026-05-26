import Link from "next/link";
import { Grid2x2PlusIcon, Send, Share2, Users } from "lucide-react";

export default function FooterOne() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#030303] via-[#0c0a16] to-[#1a0f2e] text-white/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <Grid2x2PlusIcon className="size-6 text-white" />
          <span className="text-lg font-semibold text-white">Presento</span>
        </div>
        <p className="max-w-xl text-center text-sm leading-relaxed text-white/70">
          Empowering creators worldwide with AI-driven presentation workflows.
          Transform your ideas into reality with confidence.
        </p>
        <div className="mt-6 flex items-center gap-4">
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            aria-label="Community"
          >
            <Users className="size-5" />
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            aria-label="Share"
          >
            <Share2 className="size-5" />
          </a>
          <a
            href="#"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:-translate-y-0.5 hover:border-white/40 hover:text-white"
            aria-label="Send"
          >
            <Send className="size-5" />
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-white/60">
          <Link href="/">Presento</Link> ©2025. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
