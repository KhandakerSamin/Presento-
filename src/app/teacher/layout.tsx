import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in, middleware handles the redirect.
  // This is a fallback check.
  if (!user) {
    redirect("/teacher/login");
  }

  return <>{children}</>;
}