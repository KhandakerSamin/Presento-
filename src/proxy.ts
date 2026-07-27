import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let user = null;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Ignore Supabase connection error in proxy
  }

  const hasFallbackSession = request.cookies.has("teacher_session");
  const isAuthenticated = Boolean(user || hasFallbackSession);

  const pathname = request.nextUrl.pathname;

  const isProtectedTeacherRoute =
    pathname.startsWith("/teacher/dashboard") ||
    pathname.startsWith("/teacher/sections") ||
    pathname.startsWith("/teacher/presentations") ||
    pathname.startsWith("/teacher/courses");

  if (isProtectedTeacherRoute && !isAuthenticated) {
    const loginUrl = new URL("/teacher/login", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  if ((pathname === "/teacher/login" || pathname === "/teacher/register") && isAuthenticated) {
    const dashboardUrl = new URL("/teacher/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/teacher", "/teacher/:path*"],
};