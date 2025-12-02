
import { NextResponse } from "next/server";
export async function GET(){
  const connectors = {
    openai: Boolean(process.env.OPENAI_API_KEY),
    google: Boolean(process.env.GOOGLE_API_KEY) && Boolean(process.env.GOOGLE_CSE_ID),
    bing: Boolean(process.env.BING_API_KEY),
    serper: Boolean(process.env.SERPER_API_KEY)
  };
  return NextResponse.json({ ok: connectors.openai && connectors.google, connectors });
}
