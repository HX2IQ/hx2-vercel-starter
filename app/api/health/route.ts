export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const body = {
    ok: true,
    service: "hx2-vercel",
    time: new Date().toISOString(),
    env: process.env.VERCEL_ENV || "unknown",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "unknown"
  };

  return new Response(JSON.stringify(body, null, 2) + '\n', {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
