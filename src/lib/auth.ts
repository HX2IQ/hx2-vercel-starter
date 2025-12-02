export function requireAuth(req: Request): Response | null {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.HX2_API_KEY}`;

  if (!authHeader || authHeader.trim() !== expected.trim()) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return null;
}
