import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect teacher routes (except login)
  const isTeacherRoute =
    request.nextUrl.pathname.startsWith("/teacher/dashboard") ||
    request.nextUrl.pathname.startsWith("/teacher/sections");

  if (isTeacherRoute && !user) {
    return NextResponse.redirect(new URL("/teacher/login", request.url));
  }

  // If logged in and visiting login page, redirect to dashboard
  if (request.nextUrl.pathname === "/teacher/login" && user) {
    return NextResponse.redirect(new URL("/teacher/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/teacher/:path*"],
};