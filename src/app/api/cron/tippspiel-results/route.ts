import { pollOfficialResults } from "@/lib/tippspiel-results";
import { syncStandingsIfInWindow } from "@/lib/standings-sync";
import { syncPlayerStatsIfInWindow } from "@/lib/player-stats-sync";

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
  const standings = await syncStandingsIfInWindow();
  const playerStats = await syncPlayerStatsIfInWindow();
  return Response.json({ ok: true, ...result, standings, playerStats });
}
