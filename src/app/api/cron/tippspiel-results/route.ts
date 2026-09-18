import { pollOfficialResults } from "@/lib/tippspiel-results";
import { fetchHbfSnapshot, involvesFuechse } from "@/lib/hbf";
import { saveHbfSnapshot } from "@/lib/hbf-sync";
import { syncStandingsFromHbf } from "@/lib/standings-sync";
import { syncPlayerStatsIfInWindow } from "@/lib/player-stats-sync";
import { isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const snapshot = await fetchHbfSnapshot({ noStore: true });
  if (isDatabaseConfigured()) {
    await saveHbfSnapshot(snapshot);
  }

  const fuechse = snapshot.matches.filter(involvesFuechse);
  const result = await pollOfficialResults(Date.now(), snapshot.matches);
  const standings = await syncStandingsFromHbf(snapshot.matches);
  const playerStats = await syncPlayerStatsIfInWindow(Date.now(), fuechse);
  return Response.json({
    ok: true,
    hbf: snapshot.matches.length,
    ...result,
    standings,
    playerStats,
  });
}
