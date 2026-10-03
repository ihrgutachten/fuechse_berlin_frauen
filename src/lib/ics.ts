import type { Match } from "@/lib/data";

/** Angenommene Dauer eines Handballspiels inkl. Pause und Puffer (Minuten). */
export const MATCH_DURATION_MIN = 105;

const CAL_DOMAIN = "fuechse-berlin-frauen";
export const CALENDAR_NAME = "Füchse Berlin Frauen";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** Date -> UTC-Stempel im iCalendar-Format: YYYYMMDDTHHMMSSZ */
export function toIcsUtc(date: Date): string {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/** Sonderzeichen gemäß RFC 5545 escapen. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Zeilen auf 75 Oktett falten (CRLF + Space). */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    chunks.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) chunks.push(" " + rest);
  return chunks.join("\r\n");
}

function teamLabel(team: Match["home"]): string {
  return team.emoji ? `${team.emoji} ${team.short}` : team.short;
}

function matchTitle(match: Match): string {
  const side = match.isHome ? "HEIM" : "AUSWÄRTS";
  return `${teamLabel(match.home)} vs ${teamLabel(match.away)} (${side})`;
}

function matchLocation(match: Match): string {
  const address = match.venueAddress ? match.venueAddress : match.city;
  return [match.venue, address].filter(Boolean).join(", ");
}

function matchContext(match: Match): string {
  const place = match.isHome ? "Heimspiel" : "Auswärtsspiel";
  if (match.competitionKind === "liga" && match.matchday != null) {
    return `${place} · ${match.competitionLabel} · Spieltag ${match.matchday}`;
  }
  if (match.round) return `${place} · ${match.competitionLabel} · ${match.round}`;
  return `${place} · ${match.competitionLabel}`;
}

function matchDescription(match: Match, origin?: string): string {
  const lines = [matchContext(match)];
  if (match.streamUrl) lines.push(`Stream: ${match.streamUrl}`);
  if (match.ticketUrl) lines.push(`Tickets: ${match.ticketUrl}`);
  if (origin) lines.push(`${origin}/spielplan/${match.id}`);
  return lines.join("\n");
}

function vevent(match: Match, origin?: string): string {
  const start = new Date(match.startsAt);
  const end = new Date(start.getTime() + MATCH_DURATION_MIN * 60_000);

  const lines = [
    "BEGIN:VEVENT",
    `UID:${match.id}@${CAL_DOMAIN}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(matchTitle(match))}`,
    `LOCATION:${escapeIcsText(matchLocation(match))}`,
    `DESCRIPTION:${escapeIcsText(matchDescription(match, origin))}`,
    `CATEGORIES:${escapeIcsText(match.competitionLabel)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
  ];
  if (origin) lines.push(`URL:${origin}/spielplan/${match.id}`);
  lines.push("END:VEVENT");
  return lines.map(foldLine).join("\r\n");
}

type CalendarOptions = {
  /** Absolute Origin, z. B. https://host, für Links in den Events. */
  origin?: string;
  /** Anzeigename des Kalenders. */
  name?: string;
};

/** Komplettes VCALENDAR-Dokument aus mehreren Spielen bauen. */
export function buildCalendar(matches: Match[], options: CalendarOptions = {}): string {
  const name = options.name ?? CALENDAR_NAME;
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${CAL_DOMAIN}//Spielplan//DE`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `NAME:${escapeIcsText(name)}`,
    `X-WR-CALNAME:${escapeIcsText(name)}`,
    "X-WR-TIMEZONE:Europe/Berlin",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
  ].map(foldLine);

  const body = matches.map((match) => vevent(match, options.origin));
  return [...header, ...body, "END:VCALENDAR"].join("\r\n") + "\r\n";
}

/** Einzelnes Spiel als eigenständiges VCALENDAR (für Download-Button). */
export function buildSingleEventCalendar(match: Match, options: CalendarOptions = {}): string {
  return buildCalendar([match], options);
}

/** "Zu Google Kalender hinzufügen"-Link (öffnet vorausgefüllten Dialog). */
export function googleCalendarUrl(match: Match, origin?: string): string {
  const start = new Date(match.startsAt);
  const end = new Date(start.getTime() + MATCH_DURATION_MIN * 60_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: matchTitle(match),
    dates: `${toIcsUtc(start)}/${toIcsUtc(end)}`,
    location: matchLocation(match),
    details: matchDescription(match, origin),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
