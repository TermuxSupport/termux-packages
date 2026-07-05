import { NextResponse } from "next/server";
import { ensureTable, getPool } from "../../../lib/db";
import { isAuthed } from "../../../lib/auth";

export async function GET(request) {
  const authed = await isAuthed(request);
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await ensureTable();
    const pool = getPool();
    const result = await pool.query(
      `SELECT device_id, package_version, python_version, platform, system, machine, hostname, ip,
              first_seen, last_seen, checkin_count,
              is_termux, device_brand, device_model, device_manufacturer, android_version, termux_version
       FROM devices
       ORDER BY last_seen DESC`
    );
    return NextResponse.json({ devices: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authed = await isAuthed(request);
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("device_id");
    if (!deviceId) {
      return NextResponse.json({ error: "device_id is required" }, { status: 400 });
    }

    await ensureTable();
    const pool = getPool();
    const result = await pool.query(`DELETE FROM devices WHERE device_id = $1`, [deviceId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "device not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
