import { extractText, getDocumentProxy } from "unpdf";
import { getTeamMembers } from "@/lib/data";
import { parsePressReport, type MatchReport } from "@/lib/parse-press-report";

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
  const res = await fetch(pressReportUrl(fmpMatchId), {
    headers: { Accept: "application/pdf" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) return null;

  const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
  const extracted = await extractText(pdf, { mergePages: true });
  const text = Array.isArray(extracted.text) ? extracted.text.join("\n") : extracted.text;
  return parsePressReport(text, rosterLookup());
}
