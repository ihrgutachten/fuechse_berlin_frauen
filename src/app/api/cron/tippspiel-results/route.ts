import { pollOfficialResults } from "@/lib/tippspiel-results";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await pollOfficialResults();
  return Response.json({ ok: true, ...result });
}
