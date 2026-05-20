'use client';

import { BarChart3, Download, Eye, Upload } from 'lucide-react';
import { useTeacherSections } from '@/hooks/useTeacherSections';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardStats() {
  const { stats, loading } = useTeacherSections();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Uploads',
      value: stats?.totalUploads || 0,
      icon: Upload,
      color: 'blue',
    },
    {
      label: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'green',
    },
    {
      label: 'Total Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: 'purple',
    },
    {
      label: 'Recent Uploads',
      value: stats?.recentUploads || 0,
      icon: BarChart3,
      color: 'amber',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const bgColor = colorClasses[card.color as keyof typeof colorClasses];

        return (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.label}
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`${bgColor} p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
