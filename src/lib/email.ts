const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Resend rejects non-ASCII in `from` (e.g. „Füchse“). */
function asciiDisplayName(name: string): string {
  return name
    .replace(/ä/g, "ae")
    .replace(/Ä/g, "Ae")
    .replace(/ö/g, "oe")
    .replace(/Ö/g, "Oe")
    .replace(/ü/g, "ue")
    .replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

/** Normalize EMAIL_FROM for Resend (ASCII display name + address). */
function fromAddress(): string {
  const raw = (process.env.EMAIL_FROM ?? "onboarding@resend.dev").trim();
  const match = raw.match(/^(.*)<([^>]+)>\s*$/);
  if (!match) return raw;
  const name = asciiDisplayName(match[1].trim().replace(/^["']|["']$/g, ""));
  const email = match[2].trim();
  return name ? `${name} <${email}>` : email;
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.AUTH_RESEND_KEY;
  if (!key) {
    console.error("[email] AUTH_RESEND_KEY fehlt — Mail nicht gesendet.");
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      console.error("[email] Resend-Fehler:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Versand fehlgeschlagen:", err);
    return false;
  }
}

export async function sendLoginEmail(email: string, url: string): Promise<void> {
  const ok = await sendEmail({
    to: email,
    subject: "Dein Login-Link, Füchse Berlin Frauen",
    html: `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#04140c">
    <h1 style="font-size:20px;margin:0 0 16px">Dein Login-Link</h1>
    <p style="font-size:15px;line-height:1.5">
      Hallo,<br />
      hier ist dein persönlicher Magic-Link für die Website der Füchse Berlin Frauen.
    </p>
    <p style="margin:24px 0">
      <a href="${url}" style="display:inline-block;padding:12px 20px;background:#0a5c2e;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Jetzt anmelden</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.5">
      Der Link ist nur kurze Zeit gültig und nur einmal verwendbar. Wenn du diese
      E-Mail nicht angefordert hast, kannst du sie ignorieren.
    </p>
    <p style="margin-top:32px;font-size:12px;color:#888">Füchse Berlin Frauen</p>
  </div>`,
  });

  if (!ok) {
    throw new Error("Login-Mail konnte nicht gesendet werden.");
  }
}