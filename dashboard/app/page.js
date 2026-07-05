"use client";

import { useEffect, useState, useCallback } from "react";
import "./globals.css";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function isOnline(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff < 15 * 60 * 1000;
}

export default function Home() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/devices", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const data = await res.json();
      setDevices(data.devices || []);
      setError("");
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const onlineCount = devices.filter((d) => isOnline(d.last_seen)).length;

  return (
    <div className="container">
      <div className="header">
        <h1>TermuxApp Control</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge">{devices.length} perangkat &middot; {onlineCount} online</span>
          <button className="refresh-btn" onClick={load}>Refresh</button>
        </div>
      </div>

      {loading && <div className="empty">Memuat data...</div>}
      {error && <div className="empty">{error}</div>}

      {!loading && devices.length === 0 && !error && (
        <div className="empty">
          Belum ada perangkat yang check-in.<br />
          Jalankan <code>termuxapp</code> di Termux untuk mulai memantau.
        </div>
      )}

      {devices.map((d) => (
        <div className="card" key={d.device_id}>
          <div className="card-top">
            <div className="device-id">
              <span className={`status-dot ${isOnline(d.last_seen) ? "status-online" : "status-offline"}`} />
              {d.hostname || d.device_id}
            </div>
            <span className="badge">{timeAgo(d.last_seen)}</span>
          </div>
          <div className="grid">
            <div>
              <div className="field-label">Versi Paket</div>
              <div className="field-value">{d.package_version || "-"}</div>
            </div>
            <div>
              <div className="field-label">Python</div>
              <div className="field-value">{d.python_version || "-"}</div>
            </div>
            <div>
              <div className="field-label">Platform</div>
              <div className="field-value">{d.platform || "-"}</div>
            </div>
            <div>
              <div className="field-label">Sistem</div>
              <div className="field-value">{d.system || "-"} {d.machine || ""}</div>
            </div>
            <div>
              <div className="field-label">IP</div>
              <div className="field-value">{d.ip || "-"}</div>
            </div>
            <div>
              <div className="field-label">Total Check-in</div>
              <div className="field-value">{d.checkin_count}</div>
            </div>
            <div>
              <div className="field-label">Pertama Terlihat</div>
              <div className="field-value">{new Date(d.first_seen).toLocaleString("id-ID")}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
