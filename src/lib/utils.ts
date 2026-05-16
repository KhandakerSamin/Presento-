import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Group, GroupStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSectionCode(
  deptCode: string,
  courseCode: string,
  batch: number,
  section: string
): string {
  return `${deptCode}-${courseCode}-${batch}-${section}`.toUpperCase();
}

export function getGroupStatus(group: Group, maxSize: number): GroupStatus {
  if (group.slide_link) return "submitted";
  if ((group.students?.length ?? 0) >= maxSize) return "full";
  return "open";
}

export function formatSemester(semester: string): string {
  return semester.replace("-", " ");
}