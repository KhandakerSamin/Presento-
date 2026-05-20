'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { ArrowLeft } from 'lucide-react';

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname === '/teacher/dashboard') return 'Dashboard';
    if (pathname === '/teacher/presentations') return 'Presentations';
    if (pathname === '/teacher/presentations/upload') return 'Upload Presentation';
    if (pathname.includes('/edit')) return 'Edit Presentation';
    if (pathname.includes('/sections/')) return 'Section Details';
    return 'Dashboard';
  };

  const isDashboard = pathname === '/teacher/dashboard';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {!isDashboard && (
              <button 
                onClick={() => router.push('/teacher/dashboard')}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LogoutButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
