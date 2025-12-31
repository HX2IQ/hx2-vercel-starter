export async function GET() {
  return Response.json({
    status: "ok",
    message: "registry integrity deep endpoint online",
    integrity: {
      checksum: "stub",
      nodes: 0,
      mapping: "stub"
    }
  });
}











