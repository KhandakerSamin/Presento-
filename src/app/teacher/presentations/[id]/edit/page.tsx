import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeacherLayout from '@/components/teacher/TeacherLayout';
import { EditPresentationForm } from '@/components/teacher/EditPresentationForm';

interface EditPresentationPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Edit Presentation - Presento',
    description: 'Edit presentation details',
  };
}

export default async function EditPresentationPage({
  params,
}: EditPresentationPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/teacher/login');

  // Fetch presentation
  const { data: presentation, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', params.id)
    .eq('teacher_id', user.id)
    .single();

  if (error || !presentation) {
    redirect('/teacher/presentations');
  }

  return (
    <TeacherLayout>
      <div className="px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Edit Presentation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Update the details of your presentation
          </p>
        </div>

        {/* Form */}
        <EditPresentationForm presentation={presentation} />
      </div>
    </TeacherLayout>
  );
}
