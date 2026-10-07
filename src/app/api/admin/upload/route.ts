import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no-file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "not-an-image" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }

  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const name = `news/${crypto.randomUUID()}.${ext}`;
  try {
    // Auf Vercel authentifiziert der SDK per OIDC (verbundener Store).
    // Lokal braucht es BLOB_READ_WRITE_TOKEN in .env.local.
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[upload] blob put failed:", err);
    return NextResponse.json({ error: "upload-failed" }, { status: 500 });
  }
}
