import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory store (resets on redeploy/restart)
type Stored = {
  receivedAt: string;
  taskId?: string | null;
  headers?: Record<string, string>;
  payload: any;
};

const g = globalThis as any;
g.__ap2ProofStore ??= {
  latest: null as Stored | null,
  byTaskId: new Map<string, Stored>(),
  list: [] as Stored[], // capped
};

const store = g.__ap2ProofStore;

function capList(max = 50) {
  if (store.list.length > max) store.list = store.list.slice(0, max);
}

export async function POST(req: NextRequest) {
  const receivedAt = new Date().toISOString();

  let payload: any = null;
  try {
    payload = await req.json();
  } catch {
    payload = await req.text().catch(() => null);
  }

  const url = new URL(req.url);
  const taskIdFromQuery = url.searchParams.get("taskId");
  const taskIdFromBody =
    payload?.task?.id ||
    payload?.id ||
    payload?.taskId ||
    payload?.meta?.taskId ||
    null;

  const taskId = taskIdFromQuery || taskIdFromBody;

  const headersObj: Record<string, string> = {};
  req.headers.forEach((v, k) => (headersObj[k] = v));

  const record: Stored = {
    receivedAt,
    taskId,
    headers: headersObj,
    payload,
  };

  store.latest = record;
  store.list.unshift(record);
  capList(50);

  if (taskId) {
    store.byTaskId.set(taskId, record);
  }

  return NextResponse.json({
    ok: true,
    stored: true,
    receivedAt,
    taskId,
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const taskId = url.searchParams.get("taskId");

  if (taskId) {
    const hit = store.byTaskId.get(taskId);
    if (!hit) return NextResponse.json({ ok: false, error: "not_found", taskId }, { status: 404 });
    return NextResponse.json({ ok: true, taskId, record: hit });
  }

  const mode = url.searchParams.get("mode") || "latest";

  if (mode === "list") {
    return NextResponse.json({ ok: true, count: store.list.length, records: store.list });
  }

  return NextResponse.json({ ok: true, record: store.latest });
}
