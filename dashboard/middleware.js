import { NextResponse } from "next/server";
import { isAuthed } from "./lib/auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (!isAuthed(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
