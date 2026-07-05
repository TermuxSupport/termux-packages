import { NextResponse } from "next/server";
import { ensureTable, getPool } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      device_id,
      package_version,
      python_version,
      platform,
      system,
      machine,
      hostname,
      is_termux,
      device_brand,
      device_model,
      device_manufacturer,
      android_version,
      termux_version,
    } = body || {};

    if (!device_id) {
      return NextResponse.json({ error: "device_id is required" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    await ensureTable();
    const pool = getPool();

    await pool.query(
      `INSERT INTO devices (device_id, package_version, python_version, platform, system, machine, hostname, ip,
                             is_termux, device_brand, device_model, device_manufacturer, android_version, termux_version)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (device_id) DO UPDATE SET
         package_version = EXCLUDED.package_version,
         python_version = EXCLUDED.python_version,
         platform = EXCLUDED.platform,
         system = EXCLUDED.system,
         machine = EXCLUDED.machine,
         hostname = EXCLUDED.hostname,
         ip = EXCLUDED.ip,
         is_termux = EXCLUDED.is_termux,
         device_brand = EXCLUDED.device_brand,
         device_model = EXCLUDED.device_model,
         device_manufacturer = EXCLUDED.device_manufacturer,
         android_version = EXCLUDED.android_version,
         termux_version = EXCLUDED.termux_version,
         last_seen = now(),
         checkin_count = devices.checkin_count + 1`,
      [
        device_id,
        package_version,
        python_version,
        platform,
        system,
        machine,
        hostname,
        ip,
        Boolean(is_termux),
        device_brand || null,
        device_model || null,
        device_manufacturer || null,
        android_version || null,
        termux_version || null,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
