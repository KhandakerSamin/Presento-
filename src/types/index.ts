export type Department = {
  id: string;
  code: string;
  name: string;
};

export type Course = {
  id: string;
  department_id: string;
  course_code: string;
  course_name: string;
  department?: Department;
};

export type Section = {
  id: string;
  course_id: string;
  teacher_id: string;
  semester: string;
  batch: number;
  section: string;
  section_code: string;
  group_size: number;
  is_locked: boolean;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  topic_assignment_enabled?: boolean;
  topic_assignment_mode?: 'manual' | 'serial_random' | 'student_select' | 'proposal';
  topics?: string[] | null;
  allow_multiple_selection?: boolean;
  course?: Course;
};

export type Group = {
  id: string;
  section_id: string;
  group_number: number;
  topic: string | null;
  topic_status?: 'pending' | 'approved' | 'rejected' | null;
  topic_proposal_reason?: string | null;
  slide_link: string | null;
  created_at: string;
  students?: Student[];
};

export type Student = {
  id: string;
  group_id: string;
  name: string;
  student_id: string;
  created_at: string;
};

export type Mark = {
  id: string;
  group_id: string;
  criteria_json: Record<string, number>;
  total: number;
  created_at: string;
};

export type GroupStatus = "open" | "full" | "submitted";

export type Presentation = {
  id: string;
  teacher_id: string;
  title: string;
  description?: string | null;
  course_code?: string | null;
  course_name?: string | null;
  department?: string | null;
  semester?: string | null;
  tags?: string[];
  file_path: string;
  file_size: number;
  file_format: string; // 'pdf', 'pptx', 'ppt'
  thumbnail_path?: string | null;
  views: number;
  downloads: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};