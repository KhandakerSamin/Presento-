'use client';

import Link from 'next/link';
import { Edit2, Trash2, Eye, Download, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { Presentation } from '@/types';

interface PresentationsGridProps {
  presentations: Presentation[];
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export function PresentationsGrid({
  presentations,
  onDelete,
  loading = false,
}: PresentationsGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this presentation?')) {
      return;
    }

    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !presentations) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (presentations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          No presentations yet. 
          <Link href="/teacher/presentations/upload" className="text-blue-600 hover:underline ml-2">
            Upload one now
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          My Presentations ({presentations.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {presentations.map((presentation) => (
          <div
            key={presentation.id}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-24 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0 overflow-hidden">
                {presentation.thumbnail_path ? (
                  <img
                    src={presentation.thumbnail_path}
                    alt={presentation.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">
                  {presentation.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {presentation.course_name} • {presentation.course_code}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  {presentation.department} • {presentation.semester}
                </p>

                {/* Tags */}
                {presentation.tags && presentation.tags.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {presentation.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {presentation.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
                        +{presentation.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Eye size={16} />
                    <span>{presentation.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Download size={16} />
                    <span>{presentation.downloads || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar size={16} />
                    <span>{new Date(presentation.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/teacher/presentations/${presentation.id}/edit`}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit presentation"
                >
                  <Edit2 size={18} className="text-slate-600 dark:text-slate-400" />
                </Link>
                <button
                  onClick={() => handleDelete(presentation.id)}
                  disabled={deletingId === presentation.id}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title="Delete presentation"
                >
                  <Trash2
                    size={18}
                    className="text-red-600 dark:text-red-400"
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
