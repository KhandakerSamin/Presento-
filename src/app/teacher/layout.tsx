import { getTeacherUser } from "@/lib/auth/teacher-auth";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getTeacherUser();

  return <>{children}</>;
}