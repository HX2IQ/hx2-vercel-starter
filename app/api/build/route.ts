export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  const body = {
    ok: true,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    ref: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    env: process.env.VERCEL_ENV || 'unknown',
    buildTime: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body, null, 2) + '\n', {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      'pragma': 'no-cache',
      'expires': '0',
    },
  });
}
