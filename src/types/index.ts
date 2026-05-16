export type Department = {
  id: string;
  code: string;       // "SWE", "CSE", "EEE"
  name: string;
};

export type Course = {
  id: string;
  department_id: string;
  course_code: string;  // "SE221"
  course_name: string;
};

export type Section = {
  id: string;
  course_id: string;
  semester: string;         // "Summer-2026"
  batch: number;            // 42
  section: string;          // "A"
  section_code: string;     // "SWE-SE221-42-A"
  group_size: number;
  is_archived: boolean;
  archived_at: string | null;
  created_at: string;
  course?: Course & { department?: Department };
};

export type Group = {
  id: string;
  section_id: string;
  group_number: number;
  topic: string | null;
  slide_link: string | null;
  students?: Student[];
};

export type Student = {
  id: string;
  group_id: string;
  name: string;
  student_id: string;
};

export type Mark = {
  id: string;
  group_id: string;
  criteria_json: Record<string, number>;
  total: number;
  created_at: string;
};

export type GroupStatus = "open" | "full" | "submitted";