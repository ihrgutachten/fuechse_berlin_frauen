import type { CompetitionKind } from "@/lib/data";
import { getLiveMatches } from "@/lib/data";
import { buildCalendar } from "@/lib/ics";

/** Feed darf pro Request neu rendern; CDN cached über Cache-Control. */
export const dynamic = "force-dynamic";

const KINDS: CompetitionKind[] = ["liga", "pokal", "turnier"];

function sanitizeFilename(id: string): string {
  return id.replace(/[^a-z0-9-]/gi, "-");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const matchId = url.searchParams.get("match");
  const kindParam = url.searchParams.get("kind");
  const kind = KINDS.includes(kindParam as CompetitionKind)
    ? (kindParam as CompetitionKind)
    : undefined;

  const all = await getLiveMatches(kind);

  // Einzel-Event: direkter Download für einen Spieltermin.
  if (matchId) {
    const match = all.find((item) => item.id === matchId);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }
    const body = buildCalendar([match], { origin });
    return new Response(body, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(match.id)}.ics"`,
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  }

  const body = buildCalendar(all, { origin });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="fuechse-berlin-frauen.ics"',
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}
