import { NextResponse } from "next/server";
import {
  createCaptchaChallenge,
  verifyCaptchaPlacement,
} from "@/lib/shop-captcha";
import { isShopOpen } from "@/lib/shop";

export async function GET() {
  if (!isShopOpen()) {
    return NextResponse.json({ error: "Der Shop ist derzeit geschlossen." }, { status: 403 });
  }

  try {
    const challenge = createCaptchaChallenge();
    return NextResponse.json(challenge);
  } catch (err) {
    console.error("Captcha challenge failed:", err);
    return NextResponse.json({ error: "Captcha konnte nicht geladen werden." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isShopOpen()) {
    return NextResponse.json({ error: "Der Shop ist derzeit geschlossen." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const data = body as { challengeToken?: unknown; slotId?: unknown };
  if (typeof data.challengeToken !== "string" || typeof data.slotId !== "string") {
    return NextResponse.json({ error: "Captcha-Daten fehlen." }, { status: 400 });
  }

  const result = verifyCaptchaPlacement(data.challengeToken, data.slotId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, proofToken: result.proofToken });
}
