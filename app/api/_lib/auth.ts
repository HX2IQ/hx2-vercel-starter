export function requireHx2Auth(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const ok = !!process.env.HX2_API_KEY && token === process.env.HX2_API_KEY;

  if (!ok) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  return null; // authorized
}
