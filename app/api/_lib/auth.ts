export function assertAuth(req: Request) {
  const expected = process.env.HX2_API_KEY || "ignore";
  const auth = req.headers.get("authorization") || "";
  const got = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (expected !== "ignore" && got !== expected) {
    return { ok: false as const, status: 401, error: "unauthorized" };
  }
  return { ok: true as const };
}
