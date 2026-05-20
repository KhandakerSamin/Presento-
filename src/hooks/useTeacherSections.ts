'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Presentation } from '@/types';

interface DashboardStats {
  totalUploads: number;
  totalViews: number;
  totalDownloads: number;
  recentUploads: number;
}

interface UseTeacherSectionsReturn {
  presentations: Presentation[];
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch teacher's presentations and statistics
 * Used in dashboard and presentation management pages
 */
export function useTeacherSections(): UseTeacherSectionsReturn {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      // Fetch presentations
      const { data: presentationsData, error: presentationsError } = await supabase
        .from('presentations')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (presentationsError) throw presentationsError;

      setPresentations((presentationsData || []) as Presentation[]);

      // Calculate stats
      const allPresentations = (presentationsData || []) as Presentation[];
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      setStats({
        totalUploads: allPresentations.length,
        totalViews: allPresentations.reduce((sum, p) => sum + (p.views || 0), 0),
        totalDownloads: allPresentations.reduce(
          (sum, p) => sum + (p.downloads || 0),
          0
        ),
        recentUploads: allPresentations.filter(
          (p) => new Date(p.created_at) > new Date(thirtyDaysAgo)
        ).length,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    presentations,
    stats,
    loading,
    error,
    refetch: fetchData,
  };
}
