import { routeTask } from "@/lib/ap2/taskRouter";
import type { AP2RequestBody } from "@/lib/ap2/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AP2RequestBody;

    // enforce SAFE default if missing
    if (!body.mode) body.mode = "SAFE";

    const out = await routeTask(body);
    return Response.json(out, { status: 200 });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "execute failed" }, { status: 400 });
  }
}