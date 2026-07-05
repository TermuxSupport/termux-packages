import { NextResponse } from "next/server";
import { COOKIE_NAME, makeSessionToken } from "../../../lib/auth";

export async function POST(request) {
  const body = await request.json();
  const { password } = body || {};

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, makeSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
