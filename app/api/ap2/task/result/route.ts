import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/ap2";
import { redisGetJson } from "@/app/lib/redis";

export const runtime = "nodejs";

function pickId(body: any) {
  return body?.taskId || body?.task_id || body?.job_id || body?.id || body?.jobId || null;
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json(auth.body, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const taskId = pickId(body);

  if (!taskId) return NextResponse.json({ ok:false, error:"missing_task_id" }, { status: 400 });

  // Convention: worker writes result to redis under ap2:result:<taskId>
  const key = `ap2:result:${taskId}`;
  const data = await redisGetJson(key);

  if (!data) {
    return NextResponse.json({ ok:true, found:false, taskId, key }, { status: 200 });
  }

  return NextResponse.json({ ok:true, found:true, taskId, key, data }, { status: 200 });
}
