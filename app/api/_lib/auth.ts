export function assertAuth(req: Request) {
  const expected = process.env.HX2_API_KEY || "ignore";
  const auth = req.headers.get("authorization") || "";
  const got = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (expected !== "ignore" && got !== expected) {
    return { ok: false as const, status: 401, error: "unauthorized" };
  }
  return { ok: true as const };
}

 // --- compat export (required by ap2-proof routes) ---
 // Minimal SAFE guard: checks Authorization header exists; customize later if needed.
 export async function requireHx2Auth(req: Request) {
   const h = req.headers.get("authorization") || req.headers.get("Authorization");
   if (!h) {
     return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
   }
   return null; // null means "allowed"
 }
