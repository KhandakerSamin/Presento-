import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type TeacherUser = {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
  };
};

export async function getTeacherUser(): Promise<TeacherUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        email: user.email ?? "",
        user_metadata: user.user_metadata,
      };
    }
  } catch {
    // Ignore Supabase connection errors
  }

  // Fallback session check from secure cookie
  try {
    const cookieStore = await cookies();
    const fallbackCookie = cookieStore.get("teacher_session");
    if (fallbackCookie?.value) {
      const parsed = JSON.parse(
        Buffer.from(fallbackCookie.value, "base64").toString("utf-8")
      );
      if (parsed && parsed.id && parsed.email) {
        return parsed as TeacherUser;
      }
    }
  } catch {
    // Invalid cookie format
  }

  return null;
}
