import { adminEmails } from "@/lib/admin";
import { getLiveMatches } from "@/lib/data";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { formatMatchDate } from "@/lib/format";
import {
  findMissingStreamAlerts,
  type StreamAlertCandidate,
} from "@/lib/stream-link-alert-core";

export {
  findMissingStreamAlerts,
  STREAM_ALERT_WINDOW_MS,
  type StreamAlertCandidate,
} from "@/lib/stream-link-alert-core";

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  const sql = getSql();
  if (!sql) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS stream_link_alerts (
          match_id TEXT PRIMARY KEY,
          starts_at TIMESTAMPTZ NOT NULL,
          notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((err: unknown) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

async function alreadyNotified(matchId: string): Promise<boolean> {
  const sql = getSql();
  if (!sql) return false;
  await ensureSchema();
  const rows = (await sql`
    SELECT match_id FROM stream_link_alerts WHERE match_id = ${matchId} LIMIT 1
  `) as Array<{ match_id: string }>;
  return rows.length > 0;
}

async function markNotified(matchId: string, startsAt: string): Promise<void> {
  const sql = getSql();
  if (!sql) return;
  await ensureSchema();
  await sql`
    INSERT INTO stream_link_alerts (match_id, starts_at, notified_at)
    VALUES (${matchId}, ${startsAt}::timestamptz, NOW())
    ON CONFLICT (match_id) DO NOTHING
  `;
}

async function sendMissingStreamMail(candidate: StreamAlertCandidate): Promise<boolean> {
  const to = adminEmails();
  if (to.length === 0) {
    console.error("[stream-alert] ADMIN_EMAILS fehlt. Mail nicht gesendet.");
    return false;
  }

  const when = formatMatchDate(candidate.startsAt);
  const subject = `Kein Livestream-Link: ${candidate.label} (${when})`;
  const text = [
    `Livestream-Link fehlt`,
    ``,
    `Spiel: ${candidate.label}`,
    `Wettbewerb: ${candidate.competitionLabel}`,
    `Anstoß: ${when}`,
    `Noch ca. ${candidate.hoursUntilKickoff} Stunden.`,
    `Match-ID: ${candidate.id}`,
    ``,
    `HBF liefert keinen livestreamlink, und in matches.json steht auch keiner.`,
    `Bitte den SportEurope-Link nachtragen (matches.json oder HBF).`,
  ].join("\n");

  return sendEmail({
    to,
    subject,
    text,
    html: `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#04140c">
    <h1 style="font-size:20px;margin:0 0 16px">Livestream-Link fehlt</h1>
    <p style="font-size:15px;line-height:1.5">
      Für <strong>${candidate.label}</strong> (${candidate.competitionLabel})
      am <strong>${when}</strong> ist kein Stream-Link hinterlegt
      (noch ca. ${candidate.hoursUntilKickoff}&nbsp;Stunden).
    </p>
    <p style="font-size:14px;line-height:1.5;color:#444">
      HBF liefert keinen <code>livestreamlink</code>, und in
      <code>matches.json</code> steht auch keiner. Bitte den SportEurope-Link
      nachtragen.
    </p>
    <p style="font-size:12px;color:#888;margin-top:24px">Match-ID: ${candidate.id}</p>
  </div>`,
  });
}

export type StreamAlertRunResult = {
  checked: number;
  missing: number;
  notified: string[];
  skippedAlreadySent: string[];
  failed: string[];
  skipped?: string;
};

export async function runStreamLinkAlert(now = Date.now()): Promise<StreamAlertRunResult> {
  if (!isDatabaseConfigured()) {
    return {
      checked: 0,
      missing: 0,
      notified: [],
      skippedAlreadySent: [],
      failed: [],
      skipped: "no-db",
    };
  }

  const matches = await getLiveMatches();
  const missing = findMissingStreamAlerts(matches, now);
  const notified: string[] = [];
  const skippedAlreadySent: string[] = [];
  const failed: string[] = [];

  for (const candidate of missing) {
    if (await alreadyNotified(candidate.id)) {
      skippedAlreadySent.push(candidate.id);
      continue;
    }
    const ok = await sendMissingStreamMail(candidate);
    if (!ok) {
      failed.push(candidate.id);
      continue;
    }
    await markNotified(candidate.id, candidate.startsAt);
    notified.push(candidate.id);
  }

  return {
    checked: matches.length,
    missing: missing.length,
    notified,
    skippedAlreadySent,
    failed,
  };
}
