import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nodes: [
      { id: "H2", label: "Geo/Macro", status: "online" },
      { id: "X2", label: "Crypto/Markets", status: "online" },
      { id:"K2", label: "Marketing", status: "online" },
      { id: "AH2", label: "Health", status: "online" },
      { id: "L2", label: "Legal/IP", status: "online" },
      { id: "D2", label: "Design", status: "online" },
      { id: "AP2", label: "Shadow Ops", status: "shadow" }
    ]
  });
}
