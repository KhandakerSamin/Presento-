import Link from "next/link";
import { Grid2x2PlusIcon, Send, Share2, Users } from "lucide-react";

export default function Example() {
  return (
    <footer className="flex flex-col items-center justify-center w-full py-20 bg-gradient-to-b from-[#030303] via-[#0c0a16] to-[#1a0f2e] text-white/70">
      <div className="flex items-center gap-3">
        <Grid2x2PlusIcon className="size-7 text-white" />
        <Link href="/" className="text-lg font-semibold text-white">
          Presento
        </Link>
      </div>
      <p className="mt-4 text-center text-sm text-white/60 max-w-xl">
        Empowering creators worldwide with AI-driven presentation workflows.
        Transform your ideas into reality with confidence.
      </p>
      <p className="mt-6 text-center text-sm text-white/50">
        Copyright © 2025 <Link href="/">Presento</Link>. All rights reserved.
      </p>
      <div className="flex items-center gap-4 mt-5">
        <a href="#" className="hover:-translate-y-0.5 transition-all duration-300" aria-label="Community">
          <Users className="size-5 text-white/60" />
        </a>
        <a href="#" className="hover:-translate-y-0.5 transition-all duration-300" aria-label="Share">
          <Share2 className="size-5 text-white/60" />
        </a>
        <a href="#" className="hover:-translate-y-0.5 transition-all duration-300" aria-label="Send">
          <Send className="size-5 text-white/60" />
        </a>
      </div>
    </footer>
  );
}
