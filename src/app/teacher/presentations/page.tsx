import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeacherLayout from '@/components/teacher/TeacherLayout';
import { PresentationsGrid } from '@/components/teacher/PresentationsGrid';
import Link from 'next/link';

export const metadata = {
  title: 'My Presentations - Presento',
  description: 'Manage your uploaded presentations',
};

export const dynamic = 'force-dynamic';

export default async function PresentationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/teacher/login');

  // Fetch presentations
  const { data: presentations, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching presentations:', error);
  }

  const handleDelete = async (presentationId: string) => {
    'use server';
    
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('presentations')
      .delete()
      .eq('id', presentationId)
      .eq('teacher_id', user.id);

    if (error) throw error;
  };

  return (
    <TeacherLayout>
      <div className="px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              My Presentations
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage and track your uploaded presentations
            </p>
          </div>
          <Link
            href="/teacher/presentations/upload"
            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            + Upload New
          </Link>
        </div>

        {/* Grid */}
        <PresentationsGrid 
          presentations={presentations || []} 
          onDelete={handleDelete}
        />
      </div>
    </TeacherLayout>
  );
}
