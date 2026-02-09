import { NextRequest, NextResponse } from "next/server";

function getMessageText(body: any): string {
  if (!body) return "";
  if (typeof body === "string") return body;
  return (
    body.message ??
    body.text ??
    body.input ??
    body.prompt ??
    body.content ??
    ""
  ).toString();
}
export const runtime = "nodejs";
const VER = "v4-chat-send-debug-2026-02-07";

function j(body: any, status = 200) {
  return NextResponse.json(body, { status, headers: { "x-chat-route-version": VER } });
}

function coerceMessage(obj: any): string | null {
  const msg =
    obj?.message ??
    obj?.text ??
    obj?.input ??
    obj?.prompt ??
    obj?.content;

  if (typeof msg === "string") return msg.trim() || null;
  if (msg == null) return null;

  try {
    const s = JSON.stringify(msg);
    return s.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  const cl = req.headers.get("content-length") || "";

  let jsonBody: any = null;
  let formBody: any = null;
  let textBody: string | null = null;

  // IMPORTANT: Next.js Request body can only be consumed once.
  // We choose the parser based on content-type.
  try {
    if (ct.includes("application/json")) {
      jsonBody = await req.json().catch(() => null);
      // --- Memory store intercept (SAFE) ---
      const msgText = getMessageText(jsonBody);
      const m = msgText.match(/^Store this exact fact to memory:\s*(.+)\s*$/i);
      if (m && m[1]) {
        const fact = m[1].trim();
        const sessionHdr =
          req.headers.get("x-hx2-session") ||
          req.headers.get("X-HX2-SESSION") ||
          "default";

        const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

        const r2 = await fetch(`${Gateway}/brain/memory/append`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-hx2-session": sessionHdr,
          },
          body: JSON.stringify({ text: fact }),
        });

        const j2 = await r2.json().catch(() => ({}));
        return NextResponse.json({
          ok: true,
          forwarded: true,
          url: `${Gateway}/brain/memory/append`,
          upstream_status: r2.status,
          data: j2,
        });
      }
      // --- end intercept ---
    } else if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const fd = await req.formData().catch(() => null);
      if (fd) {
        formBody = {};
        for (const [k, v] of fd.entries()) formBody[k] = v;
      }
    } else {
      textBody = await req.text().catch(() => null);
    }
  } catch {
    // fall through
  }

  const parsed_keys =
    jsonBody && typeof jsonBody === "object" ? Object.keys(jsonBody) :
    formBody && typeof formBody === "object" ? Object.keys(formBody) :
    [];

  const message =
    coerceMessage(jsonBody) ??
    coerceMessage(formBody) ??
    (typeof textBody === "string" ? textBody.trim() : null);

  if (!message) {
    return j({
      ok: false,
      error: "Send failed: Missing 'message' (or equivalent) in request body.",
      debug: {
        content_type: ct,
        content_length: cl,
        parsed_keys,
        json_type: jsonBody === null ? "null" : typeof jsonBody,
        text_len: typeof textBody === "string" ? textBody.length : null
      }
    }, 400);
  }

  const Gateway = process.env.AP2_GATEWAY_URL || "https://ap2-worker.optinodeiq.com";

  try {
    const upstream = await fetch(`${Gateway}/brain/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return j({ ok: false, forwarded: true, url: `${Gateway}/brain/chat`, upstream_status: upstream.status, data }, 502);
    }

    return j({ ok: true, forwarded: true, url: `${Gateway}/brain/chat`, data }, 200);
  } catch (e: any) {
    return j({ ok: false, error: e?.message || "unknown_error" }, 502);
  }
}
