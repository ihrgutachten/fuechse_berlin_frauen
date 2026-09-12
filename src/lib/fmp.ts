import { extractText, getDocumentProxy } from "unpdf";
import { getTeamMembers } from "@/lib/data";
import { parseEndstand, parsePressReport, type MatchReport } from "@/lib/parse-press-report";

export type { MatchReport } from "@/lib/parse-press-report";

export function pressReportUrl(fmpMatchId: string): string {
  return `https://dhbdata.fmp.sportradar.com/match/${fmpMatchId}/pressReport.pdf`;
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

/** Official full-time score from the DHB press report. Null while the match is still running. */
export async function fetchOfficialEndstand(
  fmpMatchId: string,
): Promise<{ homeScore: number; awayScore: number } | null> {
  try {
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
