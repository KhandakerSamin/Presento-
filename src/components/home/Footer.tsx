import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-12 px-4 bg-slate-900 dark:bg-slate-950 text-slate-400">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <span className="font-bold text-white">Presento</span>
            </div>
            <p className="text-sm leading-relaxed">
              Smart presentation management for university classrooms. Built for
              the SWE department.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <Link href="/teacher/login" className="hover:text-white transition-colors">
                  Teacher Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">About</h4>
            <ul className="space-y-2 text-sm">
              <li>Department: Software Engineering</li>
              <li>University: AIUB</li>
              <li>Version: V1.0</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} Presento. All rights reserved.</p>
          <p>Built with Next.js · Supabase · Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
}