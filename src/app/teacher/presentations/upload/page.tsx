import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TeacherLayout from '@/components/teacher/TeacherLayout';
import { UploadPresentationForm } from '@/components/teacher/UploadPresentationForm';

export const metadata = {
  title: 'Upload Presentation - Presento',
  description: 'Upload a new presentation',
};

export default async function UploadPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/teacher/login');

  return (
    <TeacherLayout>
      <div className="px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Upload Presentation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Share your presentation with students and track engagement
          </p>
        </div>

        {/* Form */}
        <UploadPresentationForm />
      </div>
    </TeacherLayout>
  );
}
