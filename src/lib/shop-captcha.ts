import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/** Decoy outlines in /public/shop/captcha */
export const CAPTCHA_OUTLINES = [
  "captcha-01.png",
  "captcha-02.png",
  "captcha-03.png",
  "captcha-04.png",
  "captcha-05.png",
  "captcha-06.png",
  "captcha-07.png",
  "captcha-08.png",
  "captcha-09.png",
  "captcha-10.png",
  "captcha-11.png",
] as const;

/** Shield silhouette matching captcha-pin.png (Füchse crest). */
export const CAPTCHA_TARGET_OUTLINE = "captcha-02.png";

export const CAPTCHA_PIN = "captcha-pin.png";
export const CAPTCHA_ASSET_BASE = "/shop/captcha";

const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const PROOF_TTL_MS = 15 * 60 * 1000;

export type CaptchaSlotPublic = {
  id: string;
  src: string;
};

export type CaptchaChallengePublic = {
  slots: CaptchaSlotPublic[];
  pinSrc: string;
  challengeToken: string;
  expiresAt: number;
};

type ChallengePayload = {
  typ: "challenge";
  exp: number;
  correctSlotId: string;
  nonce: string;
};

type ProofPayload = {
  typ: "proof";
  exp: number;
  nonce: string;
};

function getSecret(): string {
  const fromEnv = process.env.SHOP_CAPTCHA_SECRET?.trim();
  if (fromEnv) return fromEnv;
  // Dev fallback — set SHOP_CAPTCHA_SECRET in production.
  return process.env.SHOP_ORDER_EMAIL?.trim() || "fuechse-shop-captcha-dev";
}

function b64url(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  return buf.toString("base64url");
}

function sign(payloadB64: string): string {
  return createHmac("sha256", getSecret()).update(payloadB64).digest("base64url");
}

function seal<T extends object>(payload: T): string {
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

function open<T extends { typ: string; exp: number }>(token: string, typ: T["typ"]): T | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as T;
    if (payload.typ !== typ) return null;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function slotId(): string {
  return randomBytes(6).toString("hex");
}

export function createCaptchaChallenge(): CaptchaChallengePublic {
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  let correctSlotId = "";

  const slots: CaptchaSlotPublic[] = shuffle([...CAPTCHA_OUTLINES]).map((file) => {
    const id = slotId();
    if (file === CAPTCHA_TARGET_OUTLINE) correctSlotId = id;
    return { id, src: `${CAPTCHA_ASSET_BASE}/${file}` };
  });

  if (!correctSlotId) {
    throw new Error("Captcha target outline missing from CAPTCHA_OUTLINES.");
  }

  const challengeToken = seal<ChallengePayload>({
    typ: "challenge",
    exp: expiresAt,
    correctSlotId,
    nonce: randomBytes(8).toString("hex"),
  });

  return {
    slots,
    pinSrc: `${CAPTCHA_ASSET_BASE}/${CAPTCHA_PIN}`,
    challengeToken,
    expiresAt,
  };
}

export function verifyCaptchaPlacement(
  challengeToken: string,
  slotIdValue: string,
): { ok: true; proofToken: string } | { ok: false; error: string } {
  const challenge = open<ChallengePayload>(challengeToken, "challenge");
  if (!challenge) {
    return { ok: false, error: "Captcha abgelaufen — bitte neu laden." };
  }
  if (slotIdValue !== challenge.correctSlotId) {
    return { ok: false, error: "Das war nicht der Fuchs-Umriß. Nochmal." };
  }

  const proofToken = seal<ProofPayload>({
    typ: "proof",
    exp: Date.now() + PROOF_TTL_MS,
    nonce: challenge.nonce,
  });

  return { ok: true, proofToken };
}

export function consumeCaptchaProof(
  proofToken: unknown,
): { ok: true } | { ok: false; error: string } {
  if (typeof proofToken !== "string" || !proofToken.trim()) {
    return { ok: false, error: "Bitte zuerst den Captcha lösen (Logo auf den Umriss)." };
  }
  const proof = open<ProofPayload>(proofToken.trim(), "proof");
  if (!proof) {
    return { ok: false, error: "Captcha abgelaufen — bitte erneut lösen." };
  }
  return { ok: true };
}
