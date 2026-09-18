import { extractText, getDocumentProxy } from "unpdf";
import { getTeamMembers } from "@/lib/data";
import { fetchMatchDetailsReport, pressReportPdfUrl } from "@/lib/hbf";
import { parseEndstand, parsePressReport, type MatchReport } from "@/lib/parse-press-report";

export type { MatchReport } from "@/lib/parse-press-report";

export function pressReportUrl(fmpMatchId: string): string {
  return pressReportPdfUrl(fmpMatchId);
}

function rosterLookup() {
  return getTeamMembers().map((member) => ({
    slug: member.slug,
    name: member.name,
    number: member.number,
    photo: member.photo,
    positionLabel: member.positionLabel,
    role: member.role,
  }));
}

export async function fetchMatchReport(fmpMatchId: string): Promise<MatchReport | null> {
  const fromFeed = await fetchMatchDetailsReport(fmpMatchId, rosterLookup(), 1800);
  if (fromFeed) return fromFeed;
  const text = await pressReportText(fmpMatchId, 1800);
  if (!text) return null;
  return parsePressReport(text, rosterLookup());
}

async function pressReportText(
  fmpMatchId: string,
  revalidateSeconds: number,
): Promise<string | null> {
  const res = await fetch(pressReportUrl(fmpMatchId), {
    headers: { Accept: "application/pdf" },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) return null;
  const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
  const extracted = await extractText(pdf, { mergePages: true });
  const text = extracted.text;
  return Array.isArray(text) ? text.join("\n") : text;
}

/** Official full-time score from match-details, with press-report fallback. */
export async function fetchOfficialEndstand(
  fmpMatchId: string,
): Promise<{ homeScore: number; awayScore: number } | null> {
  try {
    const report = await fetchMatchDetailsReport(fmpMatchId, [], 120);
    if (report?.homeScore != null && report?.awayScore != null) {
      return { homeScore: report.homeScore, awayScore: report.awayScore };
    }
    const text = await pressReportText(fmpMatchId, 120);
    if (!text) return null;
    const endstand = parseEndstand(text);
    if (!endstand) return null;
    return { homeScore: endstand.homeScore, awayScore: endstand.awayScore };
  } catch (err) {
    console.error("[fmp] endstand", err instanceof Error ? err.message : err);
    return null;
  }
}
