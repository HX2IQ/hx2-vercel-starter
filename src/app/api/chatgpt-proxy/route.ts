import { NextRequest } from 'next/server';

export const runtime = 'edge';

function parseAllowedOrigins(env: string | undefined): string[] {
  if (!env || env.trim() === '') return ['https://chat.openai.com'];
  return env.split(',').map(s => s.trim()).filter(Boolean);
}

export async function OPTIONS() {
  // Minimal CORS response for preflight
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function PUT(req: NextRequest) {
  return handle(req);
}

export async function PATCH(req: NextRequest) {
  return handle(req);
}

export async function DELETE(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest): Promise<Response> {
  const allowed = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  const origin = req.headers.get('origin') || '';
  if (origin && !allowed.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get('target');
  if (!target) {
    return new Response('Missing target parameter', { status: 400 });
  }

  const hx2Base = process.env.HX2_API_BASE;
  const token = process.env.HX2_API_TOKEN;

  if (!hx2Base || !token) {
    return new Response('Server misconfigured: missing HX2_API_BASE or HX2_API_TOKEN', { status: 500 });
  }

  const upstreamUrl = `${hx2Base.replace(/\/$/, '')}/${target.replace(/^\//, '')}`;

  const method = req.method;
  const headers: Record<string, string> = {
    'Content-Type': req.headers.get('content-type') || 'application/json',
    'Authorization': `Bearer ${token}`,
  };
  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.text();

  const res = await fetch(upstreamUrl, { method, headers, body });

  // Pass-through response with JSON default
  const contentType = res.headers.get('content-type') || 'application/json';
  const text = await res.text();

  const responseHeaders: Record<string, string> = {
    'Content-Type': contentType,
  };

  // CORS echo for allowed origins (optional)
  if (origin && allowed.includes(origin)) {
    responseHeaders['Access-Control-Allow-Origin'] = origin;
    responseHeaders['Vary'] = 'Origin';
  }

  return new Response(text, { status: res.status, headers: responseHeaders });
}
