'use server';

import { createClient } from '@/lib/supabase/server';
import type { Presentation } from '@/types';

interface CreatePresentationInput {
  title: string;
  description?: string | null;
  courseCode?: string | null;
  courseName?: string | null;
  department?: string | null;
  semester?: string | null;
  tags?: string[];
  filePath: string;
  fileSize: number;
  fileFormat: string;
  thumbnailPath?: string | null;
}

interface UpdatePresentationInput {
  title?: string;
  description?: string | null;
  courseCode?: string | null;
  courseName?: string | null;
  department?: string | null;
  semester?: string | null;
  tags?: string[];
  thumbnailPath?: string | null;
}

/**
 * Create a new presentation
 */
export async function createPresentation(
  input: CreatePresentationInput
): Promise<Presentation> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('presentations')
    .insert({
      teacher_id: user.id,
      title: input.title,
      description: input.description,
      course_code: input.courseCode,
      course_name: input.courseName,
      department: input.department,
      semester: input.semester,
      tags: input.tags || [],
      file_path: input.filePath,
      file_size: input.fileSize,
      file_format: input.fileFormat,
      thumbnail_path: input.thumbnailPath,
      views: 0,
      downloads: 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create presentation: ${error.message}`);
  }

  return data as Presentation;
}

/**
 * Update an existing presentation
 */
export async function updatePresentation(
  id: string,
  input: UpdatePresentationInput
): Promise<Presentation> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.courseCode !== undefined) updateData.course_code = input.courseCode;
  if (input.courseName !== undefined) updateData.course_name = input.courseName;
  if (input.department !== undefined) updateData.department = input.department;
  if (input.semester !== undefined) updateData.semester = input.semester;
  if (input.tags !== undefined) updateData.tags = input.tags;
  if (input.thumbnailPath !== undefined) updateData.thumbnail_path = input.thumbnailPath;

  const { data, error } = await supabase
    .from('presentations')
    .update(updateData)
    .eq('id', id)
    .eq('teacher_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update presentation: ${error.message}`);
  }

  return data as Presentation;
}

/**
 * Delete a presentation
 */
export async function deletePresentation(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id)
    .eq('teacher_id', user.id);

  if (error) {
    throw new Error(`Failed to delete presentation: ${error.message}`);
  }
}

/**
 * Get a single presentation by ID
 */
export async function getPresentation(id: string): Promise<Presentation> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single();

  if (error) {
    throw new Error(`Failed to get presentation: ${error.message}`);
  }

  return data as Presentation;
}

/**
 * Get all presentations for the current teacher
 */
export async function getAllPresentations(): Promise<Presentation[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get presentations: ${error.message}`);
  }

  return (data || []) as Presentation[];
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<{
  totalUploads: number;
  totalViews: number;
  totalDownloads: number;
  recentUploads: number;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('presentations')
    .select('views, downloads, created_at')
    .eq('teacher_id', user.id);

  if (error) {
    throw new Error(`Failed to get stats: ${error.message}`);
  }

  const presentations = data || [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  return {
    totalUploads: presentations.length,
    totalViews: presentations.reduce((sum, p) => sum + (p.views || 0), 0),
    totalDownloads: presentations.reduce((sum, p) => sum + (p.downloads || 0), 0),
    recentUploads: presentations.filter(
      (p) => new Date(p.created_at) > new Date(thirtyDaysAgo)
    ).length,
  };
}
