import { unstable_noStore as noStore } from "next/cache";
import H2Client from "./H2Client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function H2Page() {
  noStore();
  return <H2Client />;
}
