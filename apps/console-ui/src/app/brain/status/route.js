export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    ok: true,
    service: "console-ui",
    brainShell: false,
    ts: new Date().toISOString(),
  });
}
