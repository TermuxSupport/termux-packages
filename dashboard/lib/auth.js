const crypto = require("crypto");

const COOKIE_NAME = "termuxapp_session";

function makeSessionToken() {
  const secret = process.env.DASHBOARD_PASSWORD || "fallback-secret";
  const day = new Date().toISOString().slice(0, 10);
  return crypto.createHmac("sha256", secret).update(day).digest("hex");
}

function isAuthed(request) {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie) return false;
  return cookie.value === makeSessionToken();
}

module.exports = { COOKIE_NAME, makeSessionToken, isAuthed };
