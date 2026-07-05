import { NextResponse } from "next/server";
import { ensureTable, getPool } from "../../../lib/db";
import { isAuthed } from "../../../lib/auth";

export async function GET(request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await ensureTable();
    const pool = getPool();
    const result = await pool.query(
      `SELECT device_id, package_version, python_version, platform, system, machine, hostname, ip,
              first_seen, last_seen, checkin_count
       FROM devices
       ORDER BY last_seen DESC`
    );
    return NextResponse.json({ devices: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
