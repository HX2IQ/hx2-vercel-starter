
import { NextResponse } from "next/server";
import { fastSearch } from "@/server/connectors/searchRouter";
import { openaiSummarize } from "@/server/connectors/openai";

function sanitize(q: string){
  return q
    .replace(/\b[\w.-]+@[\w.-]+\.\w{2,}\b/g, "[email]")
    .replace(/\b(?:\+?\d{1,3})?[-. (]*\d{3}[-. )]*\d{3}[-. ]*\d{4}\b/g, "[phone]");
}

export async function GET(req: Request){
  const u = new URL(req.url);
  const q0 = u.searchParams.get("q") || "";
  if (q0.length < 2) return NextResponse.json({ error: "q too short" }, { status: 400 });
  const q = sanitize(q0);
  try{
    const hits = await fastSearch(q, 5);
    const context = hits.map(h => `- ${h.title} (${h.link}) :: ${h.snippet||""}`).join("\n");
    const answer = await openaiSummarize(
      `Question: ${q}\nSources:\n${context}\nReturn a brief answer (<=120 words), include 2 bullets and one caveat. Mention 2 sources by title.`
    );
    return NextResponse.json({ answer, sources: hits.slice(0,3) });
  }catch(e:any){
    return NextResponse.json({ error: e.message||"failed" }, { status: 500 });
  }
}
