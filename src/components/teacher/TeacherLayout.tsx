'use client';

import DashboardSidebar from './DashboardSidebar';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { Menu } from 'lucide-react';

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/teacher/dashboard') return 'Dashboard';
    if (pathname === '/teacher/presentations') return 'Presentations';
    if (pathname === '/teacher/presentations/upload') return 'Upload Presentation';
    if (pathname.includes('/edit')) return 'Edit Presentation';
    return 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* The mobile menu toggle is inside the Sidebar component, but we can space this out */}
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white hidden lg:block">
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
