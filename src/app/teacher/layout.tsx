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
  // We'll remove the fallback check so it doesn't cause infinite redirect loops on login page.

  return <>{children}</>;
}